import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

import meta from '../meta'
import Config from '../Config'
import { i18nFile } from '../i18nFile/I18nFile'
import { ITransData } from '../i18nFile/I18nItem'
import Log from '../Log'

const EVENT_TYPE = {
  READY: 0,
  ALL_TRANS: 1,
  TRANS: 2,
  WRITE_FILE: 3
}

export abstract class TransView {
  disposables: vscode.Disposable[] = []
  panel: vscode.WebviewPanel
  filepath: string

  constructor() {
    this.init()
  }

  abstract getKeysByFilepath(filepath): string[]

  private init() {
    const cmd = vscode.commands.registerCommand(
      meta.COMMANDS.transView,
      ({
        filepath = vscode.window.activeTextEditor.document.fileName
      } = {}) => {
        this.filepath = filepath
        this.createPanel()
      }
    )

    this.disposables.push(cmd)
  }

  get shortFileName() {
    return this.filepath
      .split(path.sep)
      .slice(-3)
      .join(path.sep)
  }

  createPanel() {
    if (this.panel) {
      return
    }

    this.panel = vscode.window.createWebviewPanel(
      'transView',
      '翻译中心',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    )

    const { webview } = this.panel
    webview.html = fs.readFileSync(
      path.resolve(Config.extension.extensionPath, 'src/editor/transView.html'),
      'utf-8'
    )

    webview.onDidReceiveMessage(this.onMessage.bind(this))

    // 切换回 webview
    const viewChangeWatcher = this.panel.onDidChangeViewState(webview => {
      if (webview.webviewPanel.active) {
        this.postAllTrans()
      }
    })

    // 更换文件
    const fileWatcher = vscode.window.onDidChangeActiveTextEditor(() => {
      const activeDocument = vscode.window.activeTextEditor.document
      const isSameOrNotFile =
        activeDocument.uri.scheme !== 'file' ||
        activeDocument.fileName === this.filepath

      if (isSameOrNotFile) {
        return
      }

      this.filepath = activeDocument.fileName
      this.postAllTrans()
    })

    this.panel.onDidDispose(() => {
      viewChangeWatcher.dispose()
      fileWatcher.dispose()
      this.panel = null
    })
  }

  postAllTrans() {
    const i18n = i18nFile.getFileByFilepath(this.filepath)
    const keys = this.getKeysByFilepath(this.filepath)
    const allTrans = keys.reduce((acc, key) => {
      acc[key] = i18n.getI18n(key)
      return acc
    }, {})

    this.panel.webview.postMessage({
      type: EVENT_TYPE.ALL_TRANS,
      data: {
        shortFileName: this.shortFileName,
        sourceLocale: Config.sourceLocale,
        allTrans
      }
    })
  }

  async onMessage({ type, data }) {
    const { webview } = this.panel
    const i18n = i18nFile.getFileByFilepath(this.filepath)

    switch (type) {
      case EVENT_TYPE.READY:
        this.postAllTrans()
        break

      case EVENT_TYPE.TRANS:
        const { key, trans } = data
        const transData = await i18n.transI18n(trans)

        webview.postMessage({
          type: EVENT_TYPE.TRANS,
          data: {
            key,
            trans: transData
          }
        })
        i18n.writeI18n(transData)
        break

      case EVENT_TYPE.WRITE_FILE:
        i18n.writeI18n(data)
        break

      default:
      //
    }
  }
}
