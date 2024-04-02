import typescript from '@rollup/plugin-typescript';
import sass from 'rollup-plugin-sass';
/** https://github.com/rollup/rollup/issues/4699 */
import preserve from 'rollup-plugin-preserve-directives';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: false,
    exports: 'named',
    preserveModules: true,
  },
  cache: false,
  external: [/node_modules/],
  plugins: [typescript(), sass({ output: 'dist/styles.css' }), preserve()],
};
