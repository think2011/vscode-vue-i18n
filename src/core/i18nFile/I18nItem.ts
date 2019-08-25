import * as vscode from 'vscode'
import * as path from 'path'
import { get } from 'lodash'
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

interface ITransData extends ILng {
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

  getTrans(key: string): ITransData[] {
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
        filepath: i18nFilepath,
        key,
        keypath,
        text: get(fileCache[i18nFilepath], keypath)
      }
    })
  }

  writeTrans() {}
}
