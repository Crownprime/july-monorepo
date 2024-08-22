import assert from 'assert';
import path from 'path';

import { packageDirectorySync } from 'pkg-dir';

const appDirectory = packageDirectorySync();
assert.ok(appDirectory, 'appDirectory is not defined');

export const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);
