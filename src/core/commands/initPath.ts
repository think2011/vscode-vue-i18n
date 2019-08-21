import * as vscode from 'vscode'
import { COMMANDS } from '../meta'
import Config from '../Config'

class InitPath {
  constructor() {
    if (Config.hasI18nPaths) {
      return
    }

    this.autoSet()
  }

  autoSet() {}
}

export default () => {
  const initPath = new InitPath()

  return vscode.commands.registerCommand(COMMANDS.initPath, () => {
    initPath.autoSet()
  })
}
