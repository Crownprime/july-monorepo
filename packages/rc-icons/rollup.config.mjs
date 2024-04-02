import typescript from 'rollup-plugin-typescript2';
import svgr from '@svgr/rollup';
import resolve from '@rollup/plugin-node-resolve';

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: false,
  },
  cache: false,
  external: [/node_modules/],
  plugins: [
    resolve({ extensions: ['.ts', '.tsx', '.svg'] }),
    svgr({
      typescript: true,
      icon: true,
      svgo: true,
      svgoConfig: {
        plugins: [
          {
            name: 'customAttrs',
            fn: () => ({
              element: {
                enter: (node) => {
                  if (node.name === 'svg') {
                    node.attributes = {
                      ...node.attributes,
                      width: '1em',
                      height: '1em',
                      fill: 'currentColor',
                      focusable: false,
                      'aria-hidden': true,
                    };
                  }
                },
              },
            }),
          },
          'sortAttrs',
        ],
      },
      template: (variables, { tpl }) => {
        return tpl`
import React from 'react';
import {factory} from '../factory';
const Icon = (${variables.props}) => (${variables.jsx});
export default factory(Icon);`;
      },
    }),
    typescript(),
  ],
};
