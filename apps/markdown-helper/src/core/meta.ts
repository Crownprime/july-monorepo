import vscode from 'vscode';

export const meta = async () => {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    vscode.window.showErrorMessage('请先打开一个 markdown 文件');
    return;
  }
  const res = await vscode.window.showInputBox({
    title: '输入标题',
  });
  const title = (res || '').trim();
  const ps = new vscode.Position(0, 0);
  activeEditor.edit((e) => e.insert(ps, `---\ntitle: ${title}\ndate: ${new Date()}\nstatus: draft\n---\n`));
};
