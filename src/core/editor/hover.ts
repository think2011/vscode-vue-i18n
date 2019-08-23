import * as vscode from 'vscode'

export abstract class Hover implements vscode.HoverProvider {
  provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const key = this.getKey(document, position)
    if (!key) {
      return
    }

    const markdownText = new vscode.MarkdownString(`
||||
|---:|---|---:|
| **en** | ${key} | 单元格 |
| **ZH-TW** | ${key} | 单元格 |
| **ZH-CN** | ${key} | 单元格 |
||||
|||翻译中心|
        `)
    markdownText.isTrusted = true

    return new vscode.Hover(markdownText)
  }

  abstract getKey(
    document: vscode.TextDocument,
    position: vscode.Position
  ): string
}
