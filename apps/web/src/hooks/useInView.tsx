import {
  useCallback,
  useEffect,
  useRef,
  useState,
  MutableRefObject
} from 'react'

export const useInView = (): [MutableRefObject<null>, boolean] => {
  const ref = useRef(null)
  const [isView, setIsView] = useState(false)
  const cb = useCallback((entries: IntersectionObserverEntry[]) => {
    setIsView(Boolean(entries[0]?.isIntersecting))
  }, [])

  useEffect(() => {
    const ios = new IntersectionObserver(cb)
    if (ref.current) {
      ios.observe(ref.current)
    }
    return () => ios.disconnect()
  }, [ref.current])

  return [ref, isView]
}
