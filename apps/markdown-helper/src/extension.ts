import * as vscode from 'vscode';
import { paste } from './features/paste'

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('markdown-helper.paste', () => {
		paste()
	}));
}

export function deactivate() {}
