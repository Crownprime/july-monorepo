import path from 'path';

import type { ESLintConfig } from 'eslint-define-config';

export const defineConfig = (config: ESLintConfig): ESLintConfig => {
  const { extends: customExtends = [], ...customConfig } = config;
  return {
    extends: [path.resolve(__dirname, '../.eslint.base.js'), ...customExtends],
    ...customConfig,
  };
};
