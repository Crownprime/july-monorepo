import type { ScrollData } from './typings';

export enum Direction {
  UpOrLeft,
  DownOrRight,
}

/**
 * 连续滚动延时，超过此时间认为是第二次滚动
 */
export const DEFAULT_TIMEOUT = 100;

export const INITIAL_DATA: ScrollData = {
  scrolling: false,
  time: 0,
  direction: {
    x: null,
    y: null,
  },
  speed: {
    x: 0,
    y: 0,
  },
  totalDistance: {
    x: 0,
    y: 0,
  },
  relativeDistance: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
};
