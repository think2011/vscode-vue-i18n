import * as vscode from 'vscode'
import Log from '../core/Log'

export * from './KeyDetector'

export const KEY_REG = /(?:\$t|\$tc|\$d|\$n|\$te|this\.t|i18n\.t|[^\w]t)\(['"]([^]]+?)['"]/g

export const isVueProject = (): boolean => {
  const mainProject = vscode.workspace.workspaceFolders[0]

  if (!mainProject) {
    return false
  }

  try {
    const pkgJSON = require(`${mainProject.uri.fsPath}/package.json`)
    const { dependencies, devDependencies } = pkgJSON

    return !!dependencies['vue-i18n'] || !!devDependencies['vue-i18n']
  } catch (err) {
    Log.error(err, false)
  }
}
