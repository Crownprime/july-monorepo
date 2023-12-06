import { spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import to from 'await-to-js';
import vscode from 'vscode';

import { generateConfig } from '../utils/generate-config';

const generateMacClipboard = () =>
  new Promise<string>((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'public/scripts/clipboard.jxa.applescript');
    if (!fs.existsSync(scriptPath)) {
      return reject('clipboard.jxa.applescript 脚本损坏');
    }
    /**
     * jax 需要选择执行语言，否则默认的 AppleScript 无法执行
     */
    const script = spawn('osascript', ['-l', 'JavaScript', scriptPath]);
    const timer = setTimeout(() => {
      script.kill();
    }, 2000);
    script.on('error', () => {
      clearTimeout(timer);
      reject('osascript 运行出错');
    });
    script.stdout.on('data', (data: string) => {
      clearTimeout(timer);
      /**
       * 返回来的 data 末尾带着换行符，需要去掉
       */
      resolve(data.toString().replace('\n', '').trim());
    });
  });

const paste = async () => {
  /**
   * 其他平台以后再说吧
   */
  const { platform } = process;
  if (platform !== 'darwin') {
    vscode.window.showErrorMessage(`暂不支持 ${platform} 平台`);
    return;
  }

  const config = generateConfig();
  if (!config.local) {
    vscode.window.showErrorMessage(`请先配置 markdownHelper.local 或者在 env 中配置 local 字段`);
    return;
  }

  const [err, data] = await to<string, string>(generateMacClipboard());

  if (err) {
    vscode.window.showErrorMessage(err);
    return;
  }

  if (!data || !fs.existsSync(data)) {
    vscode.window.showErrorMessage('请先复制一张图片');
    return;
  }

  const md5 = crypto.createHash('md5');
  const hash = md5.update(fs.readFileSync(data)).digest('base64');
  const filename = hash + path.extname(data);
  const localPath = path.resolve(config.local, filename);
  const localDir = path.dirname(localPath);
  /**
   * 图片存在了需要提示是否覆盖
   */
  if (fs.existsSync(localPath)) {
    const res = await vscode.window.showQuickPick(['OK', 'NO'], { title: `${filename} 已存在，是否覆盖？` });
    if (res === 'NO') return;
  }
  /**
   * 文件夹不存在则创建
   */
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir);
  }

  fs.copyFileSync(data, localPath);

  const ps = vscode.window.activeTextEditor?.selection.active;
  if (!ps) return;
  vscode.window.activeTextEditor.edit(e => e.replace(ps, `![图片](${filename})\n`));
};

export { paste };
