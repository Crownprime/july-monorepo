import ScrollableAnchor from 'react-scrollable-anchor'
import { useInView } from '@/hooks'
import { useAnchor } from './provider'
import { useEffect } from 'react'

export const Anchor: React.FC<{ id: string }> = ({ id, children }) => {
  const { update } = useAnchor()
  const [ref, isView] = useInView()

  useEffect(() => {
    update(id, isView)
  }, [id, isView])

  return (
    <span ref={ref}>
      <ScrollableAnchor id={id}>{children}</ScrollableAnchor>
    </span>
  )
}
