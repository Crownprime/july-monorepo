import vscode, { type ExtensionContext } from 'vscode';

import { paste } from './core/paste';

const extensionScope = 'markdown-helper';

export function activate(context: ExtensionContext) {
  const subscriptions = [
    vscode.commands.registerCommand(`${extensionScope}.status`, () => {
      vscode.window.showInformationMessage('hi, i am working ~');
    }),
    vscode.commands.registerCommand(`${extensionScope}.paste`, () => {
      paste();
    }),
  ];

  context.subscriptions.push(...subscriptions);
}
