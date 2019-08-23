import * as vscode from 'vscode'
import Log from '../core/Log'

export default class Utils {
  static isVueProject(): Boolean {
    const mainProject = vscode.workspace.workspaceFolders[0]

    if (!mainProject) {
      return false
    }

    try {
      const pkgJSON = require(`${mainProject.uri.fsPath}/package.json`)
      const { dependencies, devDependencies } = pkgJSON

      return !!dependencies['vue-i18n'] || !!devDependencies['vue-i18n']
    } catch (err) {
      Log.error(err)
    }
  }
}
