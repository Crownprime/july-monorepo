import { Direction } from './constants';
import { ScrollData } from './typings';

export const getDirection = (next: number, prev: number) => {
  if (next > prev) return Direction.DownOrRight;
  if (next < prev) return Direction.UpOrLeft;
  return null;
};

type ComputeData = ScrollData & {
  timestamp: number;
};
export const generateNextScrollData = (
  prev: ComputeData,
  start: ComputeData,
  nextOffset: ComputeData['offset'],
  timestamp: number
): ScrollData => {
  /**
   * 当前时间片的移动距离
   */
  const distanceX = Math.abs(nextOffset.x - prev.offset.x);
  const distanceY = Math.abs(nextOffset.y - prev.offset.y);

  /**
   * 时间片时间，单位换算成秒
   */
  const interval = Math.max(timestamp - prev.timestamp, 1) / 1000;

  const next: ScrollData = {
    scrolling: true,
    time: timestamp - start.timestamp,
    offset: nextOffset,
    direction: {
      x: getDirection(nextOffset.x, prev.offset.x),
      y: getDirection(nextOffset.y, prev.offset.y),
    },
    totalDistance: {
      x: prev.totalDistance.x + distanceX,
      y: prev.totalDistance.y + distanceY,
    },
    speed: {
      x: distanceX / interval,
      y: distanceY / interval,
    },
    relativeDistance: {
      x: Math.abs(nextOffset.x - start.offset.x),
      y: Math.abs(nextOffset.y - start.offset.y),
    },
  };
  return next;
};
