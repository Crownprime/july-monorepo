import cls from 'classnames'
import { PropsWithChildren, useMemo } from 'react'
import jump from 'jump.js'
import { withStyled, useScrollableAnchorModel } from '@july_cm/react-lib'
import { componentCls, styles } from './styles'

const PostTocNode: React.FC<{
  node: TOCNode
  primary: boolean
  activeKey: string
  onClick?: (id: string) => void
}> = ({ node, primary, activeKey, onClick }) => {
  const active = useMemo(
    () =>
      primary
        ? node.children.map((c) => c.text).includes(activeKey) ||
          node.text === activeKey
        : node.text === activeKey,
    [primary, node, activeKey]
  )
  return (
    <div
      className={cls(`${componentCls}-node`, { primary, active })}
      onClick={() => onClick?.(node.text)}
    >
      <div className={`${componentCls}-node-circle`}></div>
      <div className={`${componentCls}-node-text`}>{node.text}</div>
    </div>
  )
}

const PostTocFC: React.FC<PropsWithChildren<{
  toc: Post['toc']
  className?: string
}>> = ({ toc, className }) => {
  const { active, anchorEls } = useScrollableAnchorModel()
  const handleClick = (id: string) => {
    const el = anchorEls.current[id]
    if (el) {
      jump(el, {
        offset: -100
      })
    }
  }
  console.log(active, 'active')
  return (
    <div className={className}>
      {toc.map((pNode) => (
        <div key={pNode.text}>
          <PostTocNode
            node={pNode}
            primary={true}
            activeKey={active}
            onClick={handleClick}
          />
          {Boolean(pNode.children.length) &&
            pNode.children.map((cNode) => (
              <PostTocNode
                node={cNode}
                primary={false}
                activeKey={active}
                key={cNode.text}
                onClick={handleClick}
              />
            ))}
        </div>
      ))}
    </div>
  )
}

export const PostToc = withStyled(PostTocFC, styles)
