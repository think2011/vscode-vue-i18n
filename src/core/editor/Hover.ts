import * as vscode from 'vscode'
import { i18nFile } from '../i18nFile'
import meta from '../meta'

export abstract class Hover implements vscode.HoverProvider {
  createCommandUrl({ name, command, params, disabled = false }) {
    return disabled
      ? name
      : `[${name}](command:${command}?${encodeURIComponent(
          JSON.stringify(params)
        )})`
  }

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
          this.createCommandUrl({
            name: '译',
            command: meta.COMMANDS.editI18n,
            params: {
              key: transItem.key,
              filepath: transItem.filepath
            }
          }),
          this.createCommandUrl({
            name: '✎',
            command: meta.COMMANDS.editI18n,
            params: {
              filepath: transItem.filepath,
              key: transItem.key,
              lng: transItem.lng
            }
          }),
          this.createCommandUrl({
            name: '×',
            command: meta.COMMANDS.delI18n,
            disabled: !transItem.text,
            params: {
              filepath: transItem.filepath,
              key: transItem.key,
              lng: transItem.lng
            }
          })
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
