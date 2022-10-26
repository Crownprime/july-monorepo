import { useEffect, useState } from 'react'

const getScroll = () => {
  return {
    x: typeof window === 'undefined' ? 0 : window.pageXOffset || window.scrollX,
    y:
      typeof window === 'undefined'
        ? 0
        : window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop,
  }
}

const useScroll = () => {
  const [scroll, setScroll] = useState(getScroll())
  useEffect(() => {
    let tick = null
    const handleScroll = () => {
      if (!tick) {
        tick = window.requestAnimationFrame(() => {
          setScroll(getScroll())
          tick = null
        })
      }
    }
    setScroll(getScroll())
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  return scroll
}

export const useScrollY = () => {
  const { y } = useScroll()
  return y
}
export const useScrollX = () => {
  const { x } = useScroll()
  return x
}
