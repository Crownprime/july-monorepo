import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

/** @type {import('rollup').RollupOptions} */
export default {
  input: {
    index: 'src/index.ts',
    client: 'src/client.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: false,
  },
  cache: false,
  external: [/node_modules/],
  plugins: [resolve(), typescript()],
};
