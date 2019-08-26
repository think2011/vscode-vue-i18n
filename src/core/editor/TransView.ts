import * as vscode from 'vscode'
import meta from '../meta'
import { ITransData } from '../i18nFile/I18nItem'
import * as fs from 'fs'
import * as path from 'path'
import Config from '../Config'
import { i18nFile } from '../i18nFile/I18nFile'
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

  constructor() {
    this.register()
  }

  abstract getKeysByFilepath(filepath): ITransData[]

  private register() {
    const cmd = vscode.commands.registerCommand(meta.COMMANDS.transView, () => {
      this.createPanel()
    })

    this.disposables.push(cmd)
  }

  get filepath() {
    return vscode.window.activeTextEditor.document.fileName
  }

  get shortFilename() {
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
      path.resolve(Config.extension.extensionPath, 'editor/transView.html'),
      'utf-8'
    )

    webview.onDidReceiveMessage(this.onMessage.bind(this))

    this.panel.onDidDispose(() => {
      this.panel = null
    })
  }

  onMessage({ type, data }) {
    const { webview } = this.panel
    const i18n = i18nFile.getFileByFilepath(this.filepath)

    switch (type) {
      case EVENT_TYPE.READY:
        const keys = this.getKeysByFilepath(this.filepath)

        console.log(keys)

        webview.postMessage({
          type: EVENT_TYPE.ALL_TRANS,
          data: {
            shortFilename: this.shortFilename,
            allTrans: this.getKeysByFilepath(this.filepath),
            sourceLocale: Config.sourceLocale
          }
        })
        break

      case EVENT_TYPE.TRANS:
        data.forEach(async (transItem: ITransData) => {
          try {
            const transText = await i18n.transByApi({
              text: transItem.text,
              from: Config.sourceLocale,
              to: transItem.lng
            })

            transItem.text = transText
            webview.postMessage({
              type: EVENT_TYPE.TRANS,
              data: transItem
            })
            i18n.writeI18n([transItem])
          } catch (err) {
            Log.error(err)
          }
        })
        break

      case EVENT_TYPE.WRITE_FILE:
        i18n.writeI18n(data)
        break

      default:
      //
    }
  }
}
