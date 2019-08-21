import * as vscode from 'vscode'

const I18N_PATHS_KEY = 'i18nPaths'

export default class Config {
  static get extension(): vscode.Extension<any> {
    return vscode.extensions.getExtension(this.extensionId)
  }

  static get extensionId() {
    return `${global.__EXT.author}.${global.__EXT.name}`
  }

  static get extensionName() {
    return global.__EXT.name
  }

  static get i18nPaths() {
    const paths = this.getConfig(I18N_PATHS_KEY)
    return paths ? paths.split(',') : []
  }

  static get hasI18nPaths() {
    return !!this.i18nPaths.length
  }

  static getConfig(key): any {
    return vscode.workspace
      .getConfiguration()
      .get(`${this.extensionName}.${key}`)
  }

  static setConfig(key, value, isGlobal = false) {
    return vscode.workspace
      .getConfiguration()
      .update(`${this.extensionName}.${key}`, value, isGlobal)
  }

  static updateI18nPaths(paths: string[]) {
    const i18nPaths = [...new Set(this.i18nPaths.concat(paths))]
    this.setConfig(I18N_PATHS_KEY, i18nPaths.join(','))
  }
}
