// import fs from 'fs';
import path from 'path';

import { format } from '@prettier/sync';
import { pascalCase } from 'change-case';
import { globSync } from 'glob';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack, { Compiler } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import VirtualModulesPlugin from 'webpack-virtual-modules';

import { PORTS } from './constants';
import { resolveApp } from './utils';

const getEntryContent = () => {
  const srcDirPath = resolveApp('');
  const components = globSync(path.resolve(srcDirPath, '**/screenshot.tsx'))
    .map(path.parse)
    .map((obj) => {
      const importPathAbsolute = path.resolve(obj.dir, obj.name);
      const routePath = path.relative(srcDirPath, path.format(obj));
      return {
        ...obj,
        importPath: path.relative(__dirname, importPathAbsolute),
        componentName: `C${pascalCase(routePath)}`,
        routePath,
      };
    });

  const imports = components
    .map((component) => `import ${component.componentName} from '${component.importPath}';`)
    .join('\n');
  const App = `
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  `;
  const content = `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

    ${imports};
    const App = () => (
      <Routes>
        ${components.map(
          (component) => `{Object.keys(${component.componentName}.components).map((key) => {
            const { components, title } = ${component.componentName};
            const Component = components[key];
            return (
              <>
                <Route key={title + '/' + key} path={title + '/' + key}
                  element={<Component />}
                />
              </>
            )
        })}`
        )}
      </Routes>
    );
    const root = createRoot(document.getElementById('root'));
    root.render(${App});
  `;
  const fileContent = format(content, {
    parser: 'typescript',
  });
  // fs.writeFileSync(path.resolve(__dirname, 'log.tsx'), fileContent);

  return fileContent;
};

const createComponentServer = async () => {
  const virtualModules = new VirtualModulesPlugin();

  const config: webpack.Configuration = {
    mode: 'development',
    entry: path.resolve(__dirname, './main.tsx'),
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        // 理论上应当由外部调用包安装，但考虑到未必有，先用自己的
        react: path.join(__dirname, '../node_modules/react'),
        'react-router-dom': path.join(__dirname, '../node_modules/react-router-dom'),
        'react-dom': path.join(__dirname, '../node_modules/react-dom'),
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          loader: require.resolve('esbuild-loader'),
          options: {
            target: 'es2015',
          },
        },
      ],
    },
    devServer: {
      port: PORTS.COMPONENT,
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(__dirname, './template.html'),
      }),
      virtualModules,
      new (class WatchEntryVirtualModulePlugin {
        apply(compiler: Compiler) {
          compiler.hooks.compilation.tap('WatchEntryVirtualModulePlugin', function () {
            virtualModules.writeModule(path.resolve(__dirname, './main.tsx'), getEntryContent());
          });
        }
      })(),
    ],
  };

  const compiler = webpack(config);
  const app = new WebpackDevServer(config.devServer, compiler);
  await app.start();
  await new Promise<void>((resolve) => {
    let _resolve: typeof resolve | undefined = resolve;
    compiler.hooks.afterCompile.tap('StartAfterCompilePlugin', () => {
      if (_resolve) {
        _resolve();
        _resolve = undefined;
      }
    });
  });
  return async () => {
    await app.stop();
  };
};

export { createComponentServer };
