const { merge, pick } = require('lodash');
const copyPlugin = require('rollup-plugin-copy');

const { resolve } = require('./constants');

const PKG_INFO = {
  name: 'markdown-helper',
  icon: 'public/icon.jpg',
  main: 'extension.js',
  contributes: {
    commands: [
      {
        title: 'Markdown 小帮手：检查插件状态',
        command: 'markdown-helper.status',
      },
      {
        title: 'Markdown 小帮手：复制图片',
        command: 'markdown-helper.paste',
      },
      {
        title: 'Markdown 小帮手：初始化 meta 信息',
        command: 'markdown-helper.meta',
      },
    ],
    configuration: {
      type: 'object',
      title: 'markdown-helper-config',
      properties: {
        'markdownHelper.env': {
          type: 'string',
          description: '指定一个配置文件路径',
        },
        'markdownHelper.local': {
          type: 'string',
          description: '指定图片存在本地的目录',
        },
      },
    },
  },
};

const STATIC_FILES = ['README.md', 'CHANGELOG.md', 'LICENSE', 'public'].map(resolve);

const copy = () =>
  copyPlugin({
    targets: [
      { src: STATIC_FILES, dest: 'dist' },
      {
        src: 'package.json',
        dest: 'dist',
        transform: (contents) => {
          const pkg = JSON.parse(contents.toString());
          pkg.name = 'markdown-helper';
          return JSON.stringify(
            merge(
              pick(pkg, [
                'displayName',
                'description',
                'version',
                'publisher',
                'repository',
                'engines',
                'categories',
                'dependencies',
              ]),
              PKG_INFO
            ),
            undefined,
            2
          );
        },
      },
    ],
    copyOnce: true,
  });

module.exports = copy;
