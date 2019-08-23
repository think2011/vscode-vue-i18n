import './GLOBAL_META'

import * as vscode from 'vscode'

import Log from './core/Log'
import Config from './core/Config'
import * as coreCommandsModules from './core/commands'

import Utils from './Utils'
import * as editorModules from './editor'

type ModuleType = (ctx: vscode.ExtensionContext) => vscode.Disposable

process.on('uncaughtException', function(err) {
  Log.error(err, false)
})

export async function activate(ctx: vscode.ExtensionContext) {
  Log.info(`🌞 Activated, v${Config.version}`)

  if (!(await Utils.isVueProject())) {
    Log.info('🌑 Inactive')
    return
  }

  Object.values({ ...coreCommandsModules, ...editorModules }).forEach(
    (module: ModuleType) => ctx.subscriptions.push(module(ctx))
  )

  // [
  //   (require('./autoInit').default,
  //   require('./guide').default,
  //   require('./hint').default,
  //   require('./extract').default,
  //   require('./completion').default,
  //   require('./transCenter').default,
  //   require('./annotation').default)
  // ].forEach(module => ctx.subscriptions.push(module(ctx)))
}

export function deactivate() {
  Log.info('🌚 Deactivated')
}
