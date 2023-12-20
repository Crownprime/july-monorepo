const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');
const json = require('@rollup/plugin-json');

const { isProd, resolve: pathResolve } = require('./constants');
const copy = require('./rollup-plugin-copy');
const stats = require('./rollup-plugin-stats');

const config = {
  input: pathResolve('src/extension.ts'),
  output: {
    dir: pathResolve('dist'),
    format: 'cjs',
    sourcemap: false,
  },
  cache: false,
  external: ['vscode'],
  plugins: [resolve(), commonjs(), json(), typescript(), copy(), !isProd && stats()],
};

module.exports = config;
