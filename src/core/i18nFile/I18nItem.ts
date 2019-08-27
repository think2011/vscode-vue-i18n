import * as vscode from 'vscode'
import * as path from 'path'
import { google, baidu, youdao } from 'translation.js'
import { get, set } from 'lodash'
import * as fs from 'fs'
import Utils from '../Utils'
import Config from '../Config'
import Log from '../Log'

interface ILng {
  localepath: string
  filepath: string
  isDirectory: boolean
  originLng: string
  lng: string
}

export interface ITransData extends ILng {
  id: string
  keypath: string
  key: string
  text: any
}

enum StructureType {
  DIR, // 结构是文件夹的模式
  FILE // 结构是语言文件的模式
}

const fileCache: any = {}

export class I18nItem {
  localepath: string
  structureType: StructureType

  constructor(localepath) {
    this.localepath = localepath
    this.setStructureType()
    this.watch()
  }

  private setStructureType() {
    const isDirectory = this.lngs.some(lngItem => lngItem.isDirectory)
    this.structureType = isDirectory ? StructureType.DIR : StructureType.FILE
  }

  private watch() {
    const watcher = vscode.workspace.createFileSystemWatcher(
      `${this.localepath}/**`
    )

    const updateFile = (type, { fsPath: filepath }) => {
      const { ext } = path.parse(filepath)
      if (ext !== '.json') return

      switch (type) {
        case 'del':
          Reflect.deleteProperty(fileCache, filepath)
          break

        case 'change':
        case 'create':
          fileCache[filepath] = this.readFile(filepath)
          break

        default:
        // do nothing..
      }
    }
    watcher.onDidChange(updateFile.bind(this, 'change'))
    watcher.onDidCreate(updateFile.bind(this, 'create'))
    watcher.onDidDelete(updateFile.bind(this, 'del'))
  }

  get lngs(): ILng[] {
    const { localepath } = this
    const files = fs
      .readdirSync(localepath)
      .map(
        (pathname: string): ILng => {
          const filepath = path.resolve(localepath, pathname)
          const isDirectory = fs.lstatSync(filepath).isDirectory()
          const originLng = isDirectory ? pathname : path.parse(pathname).name

          return {
            localepath,
            filepath,
            isDirectory,
            originLng,
            lng: Utils.normalizeLng(originLng)
          }
        }
      )
      .filter(lngItem => !!lngItem.lng)
      .sort(lngItem => {
        return lngItem.lng === Config.sourceLocale ? -1 : 1
      })

    if (!files.length) {
      Log.error(`未能识别locale目录:${localepath}`)
    }

    return files
  }

  readFile(filepath: string): any {
    try {
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
      return typeof data === 'object' ? data : {}
    } catch (err) {
      return {}
    }
  }

  async transByApi({
    text,
    from = Config.sourceLocale,
    to
  }: {
    text: string
    from?: string
    to: string
  }) {
    const plans = [google, baidu, youdao]
    const errors: Error[] = []

    let res = undefined
    for (const plan of plans) {
      try {
        res = await plan.translate({ text, from, to })
        break
      } catch (e) {
        errors.push(e)
      }
    }

    const result = res && res.result && res.result[0]
    if (!result) throw errors

    return result
  }

  transI18n(transData: ITransData[]): Promise<ITransData[]> {
    const mainTrans = transData.find(item => item.lng === Config.sourceLocale)

    const tasks = transData.map(async transItem => {
      if (transItem === mainTrans) {
        return transItem
      }

      transItem.text =
        (await this.transByApi({
          text: mainTrans.text,
          from: Config.sourceLocale,
          to: transItem.lng
        })) || transItem.text

      return transItem
    })

    return Promise.all(tasks)
  }

  removeI18n(key: string) {
    const transData = this.getI18n(key)

    transData.forEach(({ filepath, keypath }) => {
      const file = fileCache[filepath]

      Reflect.deleteProperty(file, keypath)
      fs.writeFileSync(filepath, JSON.stringify(file, null, 2))
    })
  }

  getI18n(key: string): ITransData[] {
    return this.lngs.map(lngItem => {
      let i18nFilepath = lngItem.filepath
      let keypath = key

      if (this.structureType === StructureType.DIR) {
        const [filename, ...realpath] = key.split('.')

        i18nFilepath = path.join(i18nFilepath, `${filename}.json`)
        keypath = realpath.join('.')
      }

      // 读取文件
      // TODO: LRU缓存优化
      if (!fileCache[i18nFilepath]) {
        fileCache[i18nFilepath] = this.readFile(i18nFilepath)
      }

      return {
        ...lngItem,
        id: Math.random()
          .toString(36)
          .substr(-6),
        key,
        keypath,
        filepath: i18nFilepath,
        text: get(fileCache[i18nFilepath], keypath)
      }
    })
  }

  writeI18n(transData: ITransData[]): Promise<any> {
    const writePromise = transData.map(({ filepath, keypath, text }) => {
      return new Promise((resolve, reject) => {
        if (!fileCache[filepath]) {
          fileCache[filepath] = this.readFile(filepath)
        }
        const file = fileCache[filepath]

        set(file, keypath, text)
        fs.writeFile(filepath, JSON.stringify(file, null, 2), err => {
          if (err) {
            return reject(err)
          }

          resolve()
        })
      })
    })

    return Promise.all(writePromise)
  }
}
