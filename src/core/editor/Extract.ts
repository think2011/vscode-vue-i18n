import * as vscode from 'vscode'
import Config from '../Config'

export abstract class Extract implements vscode.CodeActionProvider {
  abstract getCommands(params: any): vscode.Command[]

  provideCodeActions(): vscode.Command[] {
    const editor = vscode.window.activeTextEditor
    if (!editor || !Config.hasI18nPaths) {
      return
    }

    const { selection } = editor
    const text = editor.document.getText(selection)
    if (!text || selection.start.line !== selection.end.line) {
      return
    }

    return this.getCommands({
      filepath: editor.document.fileName,
      range: selection,
      text
    })
  }
}
