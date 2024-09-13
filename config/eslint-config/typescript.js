import eslintJs from '@eslint/js';

import tsEslint from 'typescript-eslint';
import eslintPluginImportX from 'eslint-plugin-import-x';
import eslintPrettier from './prettier.js';

import { configMerge } from './config-merge.js';

const configs = [
  eslintJs.configs.recommended,
  ...tsEslint.configs.recommended,
  ...tsEslint.configs.stylistic,
  ...eslintPrettier,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  {
    rules: {
      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'object', 'type', 'index'],
          'newlines-between': 'always',
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            {
              pattern: 'react**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '{@/**,@**}',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{**.scss,**.json,**.svg,,**.css}',
              group: 'index',
              position: 'after',
            },
          ],
        },
      ],
    },
  },
];

export default configMerge(configs, {
  files: ['**/*.{ts,tsx}'],
});
