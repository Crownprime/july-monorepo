import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

import { Articles } from './core';

import type { Article, ArticleMeta } from './typings';

/**
 * 由于代码最终会被打成 chunk，所以 dirname 等变量没有意义
 * 只能通过 cwd 递归往外面找 rush.json 作为项目根目录，然后再去定位包的位置
 * 这一步 @rushstack/rush-sdk 有提供封装好的方法: libraries/rush-lib/src/api/RushConfiguration.ts
 * 但不知道为什么 nextjs 会爆一个空 warning，猜测是 RushConfiguration.ts 引入的某个包有副作用
 * 本函数 fork RushConfiguration.tryFindRushJsonLocation
 */
const generateMdDir = () => {
  let current = process.cwd();
  let depth = 10;
  while (depth) {
    const rushConfigPath = path.join(current, 'rush.json');
    if (fs.existsSync(rushConfigPath)) {
      return current;
    }
    const parentDir = path.dirname(current);
    if (parentDir === current) {
      break;
    }
    current = parentDir;
    depth--;
  }
  return current;
};

const rootDir = generateMdDir();
const mdDir = path.resolve(rootDir, 'packages/web-articles/md');

const connect = () => {
  const articleNames = fs.readdirSync(mdDir);
  const getArticleByName = (name: string) => {
    const filePath = path.resolve(mdDir, name);
    const contents = fs.readFileSync(filePath, 'utf-8');
    const { name: fileId } = path.parse(name);
    const { data: meta, content } = matter(contents);
    /**
     * 字符串转化为时间戳
     */
    if (meta.date) {
      meta.date = +new Date(meta.date);
    }
    return { meta: meta as ArticleMeta, id: fileId, content };
  };
  return new Articles(articleNames.map(getArticleByName));
};

export const server = connect;
export default connect;
export type { Article };
