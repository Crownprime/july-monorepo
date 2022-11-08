import * as vscode from 'vscode'
import { spawn } from "child_process"
import * as fs from 'fs'
import { tmpdir } from "os"
import * as path from 'path'

enum Pkg {
  name = 'markdown-helper'
}

export const getTmpFolder = () => {
  const savePath = path.join(tmpdir(), Pkg.name)
  if (!fs.existsSync(savePath)) { fs.mkdirSync(savePath) }
  return savePath
}

export const getCurrentRoot = () => {
  const editor = vscode.window.activeTextEditor
  if (!editor || !vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length < 1) { return '' }
  const resource = editor.document.uri
  if (resource.scheme === 'vscode-notebook-cell') {
    let filePath = resource.fsPath
    let root = vscode.workspace.workspaceFolders.find(f => filePath.indexOf(f.uri.fsPath) >= 0)
    if (root) {
        return root.uri.fsPath
    } else {
        return ''
    }
  }
  if (resource.scheme !== 'file') { return '' }
  const folder = vscode.workspace.getWorkspaceFolder(resource)
  if (!folder) { return '' }
  return folder.uri.fsPath
}

export const getClipboardContext = (imagePath: string) => new Promise<string[]>((resolve, reject) => {
  if (!imagePath) {return }
  const platform = process.platform
  if (platform !== 'darwin') {
    const msg = `暂不支持 ${platform} 平台`
    vscode.window.showErrorMessage(msg)
    reject(msg)
  }
  let scriptPath = path.join(__dirname, '../public/clipboard.applescript')
  if (!fs.existsSync(scriptPath)) {
    const msg = 'clipboard.applescript 脚本文件丢失'
    vscode.window.showErrorMessage(msg)
    reject(msg)
  }
  const timer = setTimeout(() => {
    const msg = '运行脚本超时'
    vscode.window.showErrorMessage(msg)
    reject(msg)
  }, 2000)
  let ascript = spawn('osascript', [scriptPath, imagePath])
  ascript.on('error', (e: any) => {
    clearTimeout(timer)
    const msg = `spawn 运行脚本错误 ${e}`
    vscode.window.showErrorMessage(msg)
    reject(msg)
  })
  ascript.stdout.on('data', data => {
    clearTimeout(timer)
    resolve(data.toString().trim().split('\n') as string[])
  })
})

export const edit = (text: string) => {
  const ps = vscode.window.activeTextEditor?.selection.active
  if (!ps || !text) {
    return
  }
  return vscode.window.activeTextEditor?.edit(e => e.replace(ps, text))
}