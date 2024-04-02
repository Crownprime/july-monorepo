import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sass from 'rollup-plugin-sass';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: false,
  },
  cache: false,
  external: [/node_modules/, 'react'],
  plugins: [resolve(), commonjs(), typescript(), sass({ output: 'dist/styles.css' })],
};
