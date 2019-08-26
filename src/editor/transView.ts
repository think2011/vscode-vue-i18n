import * as vscode from 'vscode'
import { TransView } from '../core/editor'
import { KeyDetector } from '../utils'

class TransViewProvider extends TransView {
  getKeysByFilepath(filepath) {
    return KeyDetector.getKeyByFilepath(filepath)
  }
}

export const transViewEditor = () => {
  const transView = new TransViewProvider()
  return transView.disposables
}
