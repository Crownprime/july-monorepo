import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { last, reverse } from 'lodash-es'
import { createModel, useDebounceFn } from '../../hooks'

type Toc = {
  text: string
  children?: Toc[]
}

const checkElementPositionWidthLine = (el: DOMRect, line: number) => {
  const { top, bottom } = el
  if (bottom < line) {
    return 1
  }
  if (top > line) {
    return -1
  }
  return 0
}

const dfs = (toc: Toc[]) => {
  const list = []
  const stack = [...toc]
  reverse(stack)
  while (stack.length) {
    const i = stack.pop()
    if (!i) {
      continue
    }
    list.push(i)
    if (i?.children?.length) {
      stack.push(...i.children)
    }
  }
  return list
}

const useAnchor = (toc: Toc[] = []) => {
  const anchors = useRef(dfs(toc))
  const anchorEls = useRef<Record<string, HTMLDivElement>>({})

  const [active, setActive] = useState<string>('')

  const { run: scrollHandler } = useDebounceFn(() => {
    const leaveEls: string[] = []
    const activeEls: string[] = []
    const neverEls: string[] = []
    anchors.current.forEach((toc) => {
      const el = anchorEls.current[toc.text]
      if (!el) return
      const p = checkElementPositionWidthLine(el.getBoundingClientRect(), 100)
      if (p < 0) {
        neverEls.push(toc.text)
      } else if (p > 0) {
        leaveEls.push(toc.text)
      } else {
        activeEls.push(toc.text)
      }
    })
    const ac = activeEls[0] || last(leaveEls) || ''
    setActive(ac)
  }, 100)
  const addAnchorEl = (id: string, el: HTMLDivElement | null) => {
    if (el) {
      anchorEls.current[id] = el
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', scrollHandler, false)
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [])

  return { active, anchorEls, addAnchorEl }
}

const { Provider, useModel } = createModel(useAnchor)

export const ScrollableAnchor: React.FC<PropsWithChildren<{ id: string }>> = ({
  id,
  children
}) => {
  const { addAnchorEl } = useModel()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    addAnchorEl(id, ref.current)
  }, [id, ref.current])
  return <div ref={ref}>{children}</div>
}

export const ScrollableAnchorProvider = Provider
export const useScrollableAnchorModel = useModel
