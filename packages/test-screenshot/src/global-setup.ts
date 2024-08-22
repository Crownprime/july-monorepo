import { onExit } from 'signal-exit';

import { createBrowserServer } from './create-browser-server';
import { createComponentServer } from './create-component-server';

let queue: (() => Promise<any>)[] = [];

const teardown = () => {
  Promise.all(queue.map((fn) => fn()));
  queue = [];
};

const setup = async () => {
  const results = await Promise.allSettled([createBrowserServer(), createComponentServer()]);
  const cleaners = results.filter((item) => item.status === 'fulfilled').map((item) => item.value);
  queue.push(...cleaners);
  /** 有一个服务启动失败就停止 */
  if (results.find((item) => item.status === 'rejected')) {
    teardown();
    throw new Error('create server failed');
  }
};
/** 以防宿主意外未正确退出 */
onExit(() => {
  teardown();
});

export { setup, teardown };
