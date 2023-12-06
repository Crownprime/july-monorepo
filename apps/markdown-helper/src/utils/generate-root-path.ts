import vscode from 'vscode';

export const generateRootPath = () => {
  const workspaces = vscode.workspace.workspaceFolders;
  if (!workspaces.length) return '';
  /**
   * 如果只有一个工作区，直接返回该工作区根目录
   */
  if (workspaces.length === 1) {
    return workspaces[0].uri.fsPath;
  }
  /**
   * 如果有多个工作区且有打开的文件，则尝试定位到该文件的工作区
   */
  const current = vscode.window.activeTextEditor;
  if (current) {
    const currentWorkspace = workspaces.find(
      (space) => current.document.uri.fsPath.indexOf(space.uri.fsPath) >= 0
    );
    if (currentWorkspace) {
      return currentWorkspace.uri.fsPath;
    }
  }
  return '';
};
