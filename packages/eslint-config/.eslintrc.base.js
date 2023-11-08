// require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  parser: '@babel/eslint-parser',
  extends: ['plugin:prettier/recommended'],
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
      cwd: __dirname,
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
  },
  ignorePatterns: ['**/node_modules', '**/dist', '**/!(package).json'],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        // 优先使用单引号
        singleQuote: true,
        printWidth: 110,
        // 需要分号
        semi: true,
        // 仅在 es5 中有效的结构尾随逗号
        trailingComma: 'es5',
        // 不读取 prettier 配置文件，统一走 eslint 配置
        usePrettierrc: false,
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
    },
    {
      files: ['package.json'],
      parser: 'jsonc-eslint-parser',
      extends: ['plugin:jsonc/base', 'plugin:jsonc/prettier'],
      rules: {
        'jsonc/sort-keys': [
          'warn',
          {
            pathPattern: '^$',
            order: ['name', 'version', 'author', 'scripts', 'dependencies', 'devDependencies'],
          },
          {
            pathPattern: '^(?:dev|peer|optional|bundled)?[Dd]ependencies$',
            order: { type: 'asc' },
          },
        ],
      },
    },
  ],
};
