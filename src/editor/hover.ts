import * as vscode from 'vscode'
import { Hover } from '../core/editor'
import { KeyDetector } from '../utils'

class HoverProvider extends Hover {
  getKey(document: vscode.TextDocument, position: vscode.Position) {
    return KeyDetector.getKey(document, position)
  }
}

export const hoverEditor = () => {
  return vscode.languages.registerHoverProvider(
    [
      { language: 'vue', scheme: '*' },
      { language: 'javascript', scheme: '*' },
      { language: 'typescript', scheme: '*' }
    ],
    new HoverProvider()
  )
}
