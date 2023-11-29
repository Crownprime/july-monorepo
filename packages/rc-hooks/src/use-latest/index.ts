/**
 * 获取 state 的最新值
 * 当我们希望用最新的状态值做计算，但又不希望受到 state 响应式特性的影响时通常会创建一个 ref 同步 state 的值，本 hook 可以简化操作
 * 需要注意 ref 的值始终与视图 state 一致，不会快于 state
 * 更新链路：setState => rerender => set ref
 * 如果希望在 setState 到视图更新这段时间获取 nextState，可以出门右转试试 useStateRealtime
 */

import { useRef } from 'react';

export const useLatest = <T>(target: T) => {
  const ref = useRef<T>(target);
  ref.current = target;
  return ref;
};
