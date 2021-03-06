import { Extract } from '../core/editor'
import * as vscode from 'vscode'

class ExtractProvider extends Extract {
  keyReplace(template) {
    return key => template.replace(/{key}/g, key)
  }

  getCommands(params) {
    return [
      {
        command: 'vue-i18n.extract',
        title: `提取为$t('key')`,
        arguments: [
          {
            ...params,
            keyReplace: this.keyReplace(`{{ $t('{key}') }}`)
          }
        ]
      },
      {
        command: 'vue-i18n.extract',
        title: `提取为i18n.t('key')`,
        arguments: [
          {
            ...params,
            keyReplace: this.keyReplace(`i18n.t('{key}')`)
          }
        ]
      }
    ]
  }
}

export const extractEditor = () => {
  return vscode.languages.registerCodeActionsProvider(
    [
      { language: 'vue', scheme: '*' },
      { language: 'javascript', scheme: '*' },
      { language: 'typescript', scheme: '*' }
    ],
    new ExtractProvider(),
    {
      providedCodeActionKinds: [vscode.CodeActionKind.Refactor]
    }
  )
}
