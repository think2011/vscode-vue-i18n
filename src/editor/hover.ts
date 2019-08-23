import * as vscode from 'vscode'
// import KeyDetector from './utils/KeyDetector'
// import i18nFiles from './utils/i18nFiles'
import { Hover } from '../core/editor'

class HoverProvider extends Hover {
  getKey() {
    return '222222123f'
  }
}

export const hover = () => {
  return vscode.languages.registerHoverProvider(
    [
      { language: 'vue', scheme: '*' },
      { language: 'javascript', scheme: '*' },
      { language: 'typescript', scheme: '*' }
    ],
    new HoverProvider()
  )
}
