import * as vscode from 'vscode'
import meta from '../meta'
import { i18nFile } from '../i18nFile/I18nFile'
import Config from '../Config'

const getTransByLng = (filepath, key, lng) => {
  const i18n = i18nFile.getFileByFilepath(filepath)
  const transData = i18n.getI18n(key)

  return {
    i18n,
    transData,
    lngTransData: transData.find(transItem => transItem.lng === lng)
  }
}

export const editI18nCommand = () => {
  return vscode.commands.registerCommand(
    meta.COMMANDS.editI18n,
    async ({ filepath, key, lng }) => {
      const { i18n, transData, lngTransData } = getTransByLng(
        filepath,
        key,
        lng
      )

      const text = await vscode.window.showInputBox({
        prompt: `${key}`,
        value: lngTransData.text
      })

      if (text === undefined) {
        return
      }

      lngTransData.text = text
      i18n.writeI18n(transData)
    }
  )
}

export const delI18nCommand = () => {
  return vscode.commands.registerCommand(
    meta.COMMANDS.delI18n,
    async ({ filepath, key, lng }) => {
      const { i18n, transData, lngTransData } = getTransByLng(
        filepath,
        key,
        lng
      )
      const text = lngTransData.text

      // 删除
      lngTransData.text = ''
      await i18n.writeI18n(transData)

      const recoverText = '恢复'
      const result = await vscode.window.showInformationMessage(
        `${Config.extensionName}: 🚮 ${text}`,
        recoverText
      )

      if (result === recoverText) {
        // 恢复
        const { i18n, transData, lngTransData } = getTransByLng(
          filepath,
          key,
          lng
        )
        lngTransData.text = text
        await i18n.writeI18n(transData)
      }
    }
  )
}

export const removeI18nCommand = () => {
  return vscode.commands.registerCommand(
    meta.COMMANDS.removeI18n,
    async ({ filepath, key }) => {
      const i18n = i18nFile.getFileByFilepath(filepath)
      const transData = i18n.getI18n(key)

      i18n.removeI18n(key)

      const recoverText = '恢复'
      const result = await vscode.window.showInformationMessage(
        `${Config.extensionName}: 🚮 ${key}`,
        recoverText
      )

      if (result === recoverText) {
        i18n.writeI18n(transData)
      }
    }
  )
}
