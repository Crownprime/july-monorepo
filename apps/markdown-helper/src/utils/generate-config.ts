import fs from 'fs';
import path from 'path';

import { parse } from 'dotenv';
import vscode from 'vscode';

import { generateRootPath } from './generate-root-path';

interface Config {
  env?: string;
  local?: string;
}

const CONFIG_KEYS = ['env', 'local'];

export const generateConfig = () => {
  const config: Config = {};
  const configuration = vscode.workspace.getConfiguration('markdownHelper');
  console.log('configuration: ', configuration);

  CONFIG_KEYS.forEach((key) => {
    if (configuration.has(key)) {
      config[key] = configuration.get(key);
    }
  });

  const rootPath = generateRootPath();
  /**
   * 如果存在 env，则读取 env 配置并且覆盖前面的配置
   */
  const env = configuration.get<string>('env');
  if (env) {
    const envPath = path.isAbsolute(env) ? env : path.resolve(rootPath, env);
    if (fs.existsSync(envPath)) {
      const envConfig = parse(fs.readFileSync(envPath, 'utf-8'));
      Object.assign(config, envConfig);
    }
  }

  /**
   * 本地的存储路径如果是相对路径也转化为绝对路径
   */
  if (config.local && !path.isAbsolute(config.local)) {
    config.local = path.resolve(rootPath, config.local);
  }
  console.log('final config:', config);
  return config;
};
