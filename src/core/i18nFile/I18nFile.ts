import * as vscode from 'vscode'
import * as path from 'path'
import Config from '../Config'
import { I18nItem } from './I18nItem'

class I18nFile {
  i18nItems = new Map<String, I18nItem>()

  getFileByFilepath(filepath: string): I18nItem {
    const localepath = this.getRelativePathByFilepath(filepath)
    const i18nFile = this.i18nItems.get(localepath)

    if (i18nFile) {
      return i18nFile
    }

    this.i18nItems.set(localepath, new I18nItem(localepath))
    return this.i18nItems.get(localepath)
  }

  getRelativePathByFilepath(filepath: string): string {
    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
    const i18nPaths = Config.i18nPaths

    const i18nRootPath = i18nPaths
      .map((pathItem: string) => path.resolve(rootPath, pathItem))
      .sort((a: string, b: string) =>
        //通过对比哪个更接近来确定符合要求的目录
        path.relative(filepath, a).length > path.relative(filepath, b).length
          ? 1
          : -1
      )[0]

    return i18nRootPath
  }
}

export const i18nFile = new I18nFile()
