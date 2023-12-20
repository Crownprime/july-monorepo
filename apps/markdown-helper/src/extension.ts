import vscode, { type ExtensionContext } from 'vscode';

import { commands } from './commands';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    ...commands.map(({ command, callback }) => vscode.commands.registerCommand(command, callback))
  );
}
