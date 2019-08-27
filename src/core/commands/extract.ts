import * as vscode from 'vscode'

import meta from '../meta'
import * as path from 'path'
import { i18nFile } from '../i18nFile'
import Config from '../Config'

const toCamelCase = str => {
  return str.replace(/(-\w)/g, $1 => {
    return $1[1].toUpperCase()
  })
}

const onExtract = async ({
  filepath,
  text,
  range,
  template
}: {
  filepath: string
  text: string
  range: vscode.Range
  template: string
}) => {
  // 生成参考key
  let relativeName: any = path.relative(vscode.workspace.rootPath, filepath)
  relativeName = path.parse(relativeName)

  let defaultKey = relativeName.dir
    .split(path.sep)
    .splice(1)
    .concat(relativeName.name)
    .map(toCamelCase)

  if (defaultKey.length > 1) {
    defaultKey = defaultKey.splice(1)
  }

  defaultKey = `${defaultKey.join('.')}.${Math.random()
    .toString(36)
    .substr(-6)}`

  let key = await vscode.window.showInputBox({
    prompt: `请输入要保存的路径 (例如:home.document.title)`,
    valueSelection: [defaultKey.lastIndexOf('.') + 1, defaultKey.length],
    value: defaultKey
  })

  if (!key) {
    return
  }

  const i18n = i18nFile.getFileByFilepath(filepath)

  // 重复检测
  const isOverride = await i18n.overrideCheck(key)
  if (!isOverride) {
    return
  }

  // 替换内容
  vscode.window.activeTextEditor.edit(editBuilder => {
    const { start, end } = vscode.window.activeTextEditor.selection

    editBuilder.replace(
      new vscode.Range(start, end),
      template.replace(/{key}/g, key)
    )
  })

  // 翻译内容
  let transData = i18n.getI18n(key)
  const mainTrans = transData.find(item => item.lng === Config.sourceLocale)

  mainTrans.text = text
  transData = await i18n.transI18n(transData)

  // 写入翻译
  i18n.writeI18n(transData)
}

export const extract = () => {
  return vscode.commands.registerCommand(meta.COMMANDS.extract, onExtract)
}
