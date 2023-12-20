import vscode from 'vscode';

import { meta } from './core/meta';
import { paste } from './core/paste';

const extensionScope = 'markdown-helper';

export const commands = [
  {
    command: `${extensionScope}.status`,
    callback: () => {
      vscode.window.showInformationMessage('hi, i am working ~');
    },
  },
  {
    command: `${extensionScope}.paste`,
    callback: paste,
  },
  {
    command: `${extensionScope}.meta`,
    callback: meta,
  },
];
