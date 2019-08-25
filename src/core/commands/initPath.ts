import * as vscode from 'vscode'
import * as fg from 'fast-glob'

import meta from '../meta'
import Config from '../Config'
import Log from '../Log'

class InitPath {
  constructor() {
    if (Config.hasI18nPaths) {
      return
    }

    this.autoInit()
  }

  async autoInit() {
    const rootPath = vscode.workspace.rootPath
    const pattern = [`${rootPath}/**/(locales|locale|i18n|lang|langs)`]
    const result: any[] = await fg(pattern, {
      ignore: ['**/node_modules'],
      onlyDirectories: true
    })

    Config.updateI18nPaths(result)

    const info = `${Config.extensionName}:🌟已帮你配置以下目录\n ${result.join(
      '\n'
    )}`

    vscode.window.showInformationMessage(info)
    Log.info(info)
  }

  async manualInit() {
    const okText = '立即配置'
    const result = await vscode.window.showInformationMessage(
      `${Config.extensionName}: 项目里的locales文件夹在哪？`,
      okText
    )

    if (result !== okText) {
      return
    }

    const dirs = await this.pickDir()
    Config.updateI18nPaths(dirs)

    this.success()
  }

  async pickDir(): Promise<string[]> {
    let dirs = await vscode.window.showOpenDialog({
      defaultUri: vscode.Uri.file(vscode.workspace.rootPath),
      canSelectFolders: true
    })

    return dirs.map(dirItem => dirItem.path)
  }

  async success() {
    const okText = '继续配置'
    const result = await vscode.window.showInformationMessage(
      `${Config.extensionName}: 配置好了，还有其他目录吗？`,
      okText,
      '没有了'
    )

    if (result !== okText) {
      return
    }

    this.manualInit()
  }
}

const initPath = new InitPath()

export const autoInitCommand = () => {
  return vscode.commands.registerCommand(meta.COMMANDS.autoInitPath, () => {
    initPath.autoInit()
  })
}

export const manualInitCommand = () => {
  return vscode.commands.registerCommand(meta.COMMANDS.manualInitPath, () => {
    initPath.manualInit()
  })
}
