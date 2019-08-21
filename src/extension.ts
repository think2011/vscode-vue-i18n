import * as vscode from 'vscode'
import Common from './utils/Common'
import { Log } from './core'
import { version } from '../package.json'

import './GLOBAL_META'

process.on('uncaughtException', function(err) {
  Log.error(err, false)
})

export async function activate(ctx: vscode.ExtensionContext) {
  Log.info(`🌞 Activated, v${version}`)

  if (!vscode.workspace.workspaceFolders || !(await Common.isVueProject())) {
    console.log('🌑 Inactive')
    return
  }

  [
    require('./autoInit').default,
    require('./guide').default,
    require('./hint').default,
    require('./extract').default,
    require('./completion').default,
    require('./transCenter').default,
    require('./annotation').default
  ].forEach(module => ctx.subscriptions.push(module(ctx)))
}

export function deactivate() {
  Log.info('🌚 Deactivated')
}
