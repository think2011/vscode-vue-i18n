import * as vscode from 'vscode'
import { i18nFile } from '../i18nFile'

export abstract class Hover implements vscode.HoverProvider {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const key = this.getKey(document, position)
    if (!key) {
      return
    }

    const i18n = i18nFile.getFileByFilepath(document.fileName)
    const transData = i18n.getI18n(key)
    const transText = transData
      .map(transItem => {
        const commands = [
          '[译](command:extension.vue-i18n.config)',
          '[✎](command:extension.vue-i18n.config)',
          '[×](command:extension.vue-i18n.config)'
        ].join(' ')

        return `| **${transItem.lng}** | ${transItem.text ||
          '-'} | ${commands} |`
      })
      .join('\n')

    const markdownText = new vscode.MarkdownString(`
||||
|---:|---|---:|
${transText}
||||`)
    markdownText.isTrusted = true

    return new vscode.Hover(markdownText)
  }

  abstract getKey(
    document: vscode.TextDocument,
    position: vscode.Position
  ): string
}
