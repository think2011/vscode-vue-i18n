import * as vscode from 'vscode'
import Utils from './Utils'

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

  static get version() {
    return this.extension.packageJSON.version
  }

  static get hasI18nPaths() {
    return !!this.i18nPaths.length
  }

  static get sourceLocale() {
    return Utils.normalizeLng(this.getConfig('sourceLocale') || 'zh-CN')
  }

  static getConfig(key): any {
    return vscode.workspace.getConfiguration(this.extensionName).get(key)
  }

  static setConfig(key, value, isGlobal = false) {
    return vscode.workspace
      .getConfiguration(this.extensionName)
      .update(key, value, isGlobal)
  }

  static updateI18nPaths(paths: string[]) {
    const i18nPaths = [...new Set(this.i18nPaths.concat(paths))]
    this.setConfig(I18N_PATHS_KEY, i18nPaths.join(','))
  }
}
