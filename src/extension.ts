import * as vscode from 'vscode'

// 初始化全局配置
import Config from './core/Config'
Config.extAuthor = 'think2011'
Config.extName = 'vue-i18n'

import Log from './core/Log'
import * as coreCommandsModules from './core/commands'

import { isVueProject } from './utils'
import * as editorModules from './editor'

type ModuleType = (
  ctx: vscode.ExtensionContext
) => vscode.Disposable | vscode.Disposable[]

process.on('uncaughtException', function(err) {
  Log.error(err, false)
})

export async function activate(ctx: vscode.ExtensionContext) {
  Log.info(`🌞 ${Config.extensionName} Activated, v${Config.version}`)

  if (!(await isVueProject())) {
    Log.info('🌑 Inactive')
    return
  }

  const modules = Object.values({ ...coreCommandsModules, ...editorModules })
  modules.forEach((module: ModuleType) => {
    const disposables = module(ctx)

    if (Array.isArray(disposables)) {
      ctx.subscriptions.push(...disposables)
    } else {
      ctx.subscriptions.push(disposables)
    }
  })
}

export function deactivate() {
  Log.info('🌚 Deactivated')
}
