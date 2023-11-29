import type { Direction } from './constants';

type XY<T> = {
  x: T;
  y: T;
};

export type ScrollData = {
  scrolling: boolean;
  time: number;
  direction: XY<Direction | null>;
  speed: XY<number>;
  offset: XY<number>;
  relativeDistance: XY<number>;
  totalDistance: XY<number>;
};

export type Events = {
  onScroll?: (data: ScrollData) => void;
  onScrollStart?: (data: ScrollData) => void;
  onScrollEnd?: (data: ScrollData) => void;
};
