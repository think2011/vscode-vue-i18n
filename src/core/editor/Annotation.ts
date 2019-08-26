import * as vscode from 'vscode'
import { debounce } from 'lodash'
import { i18nFile } from '../i18nFile/index'
import Config from '../Config'

const textEditorDecorationType = vscode.window.createTextEditorDecorationType(
  {}
)

const unuseDecorationType = vscode.window.createTextEditorDecorationType({
  opacity: '0.6'
})

export abstract class Annotation {
  abstract get KEY_REG(): RegExp
  disposables: vscode.Disposable[] = []

  constructor() {
    const { disposables } = this
    const debounceUpdate = debounce(() => this.update(), 800)

    Config.i18nPaths.forEach(i18nPath => {
      const i18nDirWatcher = vscode.workspace.createFileSystemWatcher(
        `${i18nPath}/**`
      )

      i18nDirWatcher.onDidChange(debounceUpdate)
      i18nDirWatcher.onDidCreate(debounceUpdate)
      i18nDirWatcher.onDidDelete(debounceUpdate)
      disposables.push(i18nDirWatcher)
    })

    disposables.push(
      vscode.window.onDidChangeActiveTextEditor(debounceUpdate),
      vscode.workspace.onDidChangeTextDocument(debounceUpdate)
    )
  }

  update() {
    const activeTextEditor = vscode.window.activeTextEditor
    if (!activeTextEditor) {
      return
    }

    const { document } = activeTextEditor
    const text = document.getText()
    const decorations = []
    const unuseDecorations = []

    activeTextEditor.setDecorations(unuseDecorationType, [])
    activeTextEditor.setDecorations(textEditorDecorationType, [])

    // 从文本里遍历生成中文注释
    let match = null
    while ((match = this.KEY_REG.exec(text))) {
      const index = match.index
      const matchKey = match[0]
      const key = matchKey.replace(new RegExp(this.KEY_REG), '$1')
      const i18n = i18nFile.getFileByFilepath(document.fileName)
      const trans = i18n.getI18n(key)
      const { text: mainText = '' } =
        trans.find(transItem => transItem.lng === Config.sourceLocale) || {}

      const range = new vscode.Range(
        document.positionAt(index),
        document.positionAt(index + matchKey.length + 1)
      )
      const decoration = {
        range,
        renderOptions: {
          after: {
            color: 'rgba(153, 153, 153, .7)',
            contentText: mainText ? `›${mainText}` : '',
            fontWeight: 'normal',
            fontStyle: 'normal'
          }
        }
      }

      // 没有翻译的文案透明化处理
      if (!mainText) {
        unuseDecorations.push({ range })
        activeTextEditor.setDecorations(unuseDecorationType, unuseDecorations)
      }

      decorations.push(decoration)
      activeTextEditor.setDecorations(textEditorDecorationType, decorations)
    }
  }
}
