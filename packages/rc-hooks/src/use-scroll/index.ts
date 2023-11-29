import React, { useCallback, useLayoutEffect, useRef } from 'react';

import { pick } from 'lodash-es';

import { INITIAL_DATA, DEFAULT_TIMEOUT } from './constants';
import { Events, ScrollData } from './typings';
import { generateNextScrollData } from './utils';
import { useStateRealtime } from '../use-state-realtime';

const useScroll = <T extends HTMLElement = any>(
  events: Events = {},
  deps: any[] = []
): [React.MutableRefObject<T>, ScrollData] => {
  /**
   * 监听的 DOM 元素
   */
  const ref = useRef<T>(null);

  /**
   * timer
   */
  const timer = useRef<number>();
  /**
   * frame
   */
  const frameRef = useRef<number>();

  /**
   * data
   */
  const [data, setData, dataRef] = useStateRealtime(INITIAL_DATA);
  /**
   * compute data
   */
  const startDataRef = useRef(data);
  const startTimestamp = useRef<number>(0);
  const prevTimestamp = useRef<number>(0);

  const compute = useCallback(
    (timestamp: number) => {
      const el = ref.current;
      if (!el) return;
      if (!startTimestamp.current) startTimestamp.current = timestamp;
      const nextOffset = {
        x: el.scrollLeft,
        y: el.scrollTop,
      };
      const next = generateNextScrollData(
        { ...dataRef.current, timestamp: prevTimestamp.current },
        {
          ...startDataRef.current,
          timestamp: startTimestamp.current,
        },
        nextOffset,
        timestamp
      );
      setData(next);
      prevTimestamp.current = timestamp;
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = window.requestAnimationFrame(compute);
    },
    [ref]
  );

  const handleScrollStart = useCallback(() => {
    startDataRef.current = dataRef.current;
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(compute);
    events.onScrollStart?.(dataRef.current);
  }, []);
  const handleScrollEnd = useCallback(() => {
    const next: ScrollData = {
      ...dataRef.current,
      /**
       * 结束一次滚动后，一些滚动时的实时数据需要清空
       */
      ...pick(INITIAL_DATA, ['scrolling', 'time', 'speed', 'direction']),
    };
    setData(next);
    window.cancelAnimationFrame(frameRef.current);
    startTimestamp.current = 0;
    prevTimestamp.current = 0;
    events.onScrollEnd?.(next);
  }, []);

  /**
   * 重置计时
   */
  const resetTimer = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(handleScrollEnd, DEFAULT_TIMEOUT);
  }, []);

  const handleScroll = useCallback(() => {
    if (!dataRef.current.scrolling) {
      handleScrollStart();
    }
    events.onScroll?.(dataRef.current);
    resetTimer();
  }, [dataRef.current, events?.onScroll, resetTimer]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return () => {};
    el.addEventListener('scroll', handleScroll, true);
    return () => {
      el.removeEventListener('scroll', handleScroll, true);
    };
  }, [ref, ...deps]);

  return [ref, data];
};

export { useScroll };
export type { ScrollData };
