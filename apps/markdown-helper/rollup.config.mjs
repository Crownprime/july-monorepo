import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/extension.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: false,
  },
  cache: false,
  external: ['vscode'],
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript(),
    copy({
      targets: [
        { src: ['README.md', 'CHANGELOG.md', 'LICENSE', 'public'], dest: 'dist' },
        {
          src: 'package.json',
          dest: 'dist',
          transform: (contents) => {
            const pkg = JSON.parse(contents);
            pkg.name = 'markdown-helper';
            return JSON.stringify(pkg);
          },
        },
      ],
      copyOnce: true,
    }),
  ],
};
