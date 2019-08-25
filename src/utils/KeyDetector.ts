import * as vscode from 'vscode'
import * as fs from 'fs'
import { KEY_REG } from './'

export class KeyDetector {
  static getKeyByContent(text: string) {
    const keys = (text.match(KEY_REG) || []).map(key =>
      key.replace(KEY_REG, '$1')
    )

    return [...new Set(keys)]
  }

  static getKeyByFilepath(filePath: string) {
    const file: string = fs.readFileSync(filePath, 'utf-8')
    return this.getKeyByContent(file)
  }

  static getKey(document: vscode.TextDocument, position: vscode.Position) {
    const keyRange = document.getWordRangeAtPosition(position, KEY_REG)

    return keyRange
      ? document.getText(keyRange).replace(KEY_REG, '$1')
      : undefined
  }
}
