/**
 * 对 useState 增强，在 setState 到 useEffect 之间可以通过 ref 获取实时值
 */
import { useState, useRef, type Dispatch, type SetStateAction, useCallback } from 'react';

import { isFunction } from 'lodash-es';

function useStateRealtime<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>, React.MutableRefObject<S>];
function useStateRealtime<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
  React.MutableRefObject<S>,
];
function useStateRealtime<S>(initialState?: S | (() => S)) {
  const [data, setData] = useState(initialState);
  const dataRef = useRef(data);
  const setRealtimeData: Dispatch<SetStateAction<S | undefined>> = useCallback(
    (next) => {
      const nextState = isFunction(next) ? next(dataRef.current) : next;
      dataRef.current = nextState;
      setData(nextState);
    },
    [dataRef, setData]
  );

  return [data, setRealtimeData, dataRef];
}

export { useStateRealtime };
