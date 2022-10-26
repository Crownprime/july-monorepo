import { useCallback, useMemo, useState } from 'react'
import createModal from '@/hooks/createModal'

const useAnchorHook = () => {
  const [map, set] = useState(new Map())
  const update = useCallback(
    (id: string, isView: boolean) => {
      set(v => new Map(v.set(id, isView)))
    },
    [set],
  )
  const id = useMemo(() => {
    return [...map].filter(([, isView]) => isView)[0]?.[0]
  }, [map])
  return { id, update }
}

export const AnchorContext = createModal(useAnchorHook)

export const useAnchor = () => AnchorContext.useModal()
