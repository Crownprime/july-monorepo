import eslintJs from '@eslint/js';

import { configMerge } from './config-merge.js';
import eslintPrettier from './prettier.js';

const configs = [eslintJs.configs.recommended, ...eslintPrettier];

export default configMerge(configs, {
  files: ['**/*.{js,mjs,cjs,jsx}'],
});
