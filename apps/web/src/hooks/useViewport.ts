import { useEffect, useState, useCallback } from 'react'

export const useResize = (fn: (this: Window, ev: UIEvent) => any) => {
  useEffect(() => {
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [fn])
}

export const useViewport = () => {
  const [vw, setVw] = useState(0)
  const [vh, setVh] = useState(0)
  const setSizes = useCallback(() => {
    setVw(window.innerWidth)
    setVh(window.innerHeight)
  }, [])
  useResize(setSizes)
  useEffect(setSizes, [])

  return { vw, vh }
}
