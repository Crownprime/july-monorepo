import { FC } from 'react'
import cls from 'classnames'
import { head } from 'lodash-es'
import ReactMarkdown from 'react-markdown'
import { configureAnchors } from 'react-scrollable-anchor'
import { Anchor, useAnchor, AnchorContext } from '@/components/post-toc'
import { HEADER_HEIGHT } from '@/constants/header'
import {
  PreTarget,
  CodeTarget,
  ATarget,
  ImgTarget,
  H1Target,
  PTarget,
  UlTarget,
} from '@/components/post-target'
import { PostTextWrap } from './styled'

configureAnchors({ offset: -(HEADER_HEIGHT + 20) })

const PostHtml: FC<{ data: Post }> = ({ data }) => {
  return (
    <ReactMarkdown
      components={{
        h1({ children }) {
          const headText = head(children as string[])
          return (
            <Anchor id={headText}>
              <H1Target>{headText}</H1Target>
            </Anchor>
          )
        },
        h2({ children }) {
          return (
            <Anchor id={head(children as string[])}>
              <h2>{head(children)}</h2>
            </Anchor>
          )
        },
        p({ children, ...props }) {
          return <PTarget {...props}>{children}</PTarget>
        },
        ul({ children, ...props }) {
          return <UlTarget {...props}>{children}</UlTarget>
        },
        img: ImgTarget,
        pre: PreTarget,
        code: CodeTarget,
        a: ATarget,
      }}
    >
      {data.content}
    </ReactMarkdown>
  )
}

const PostToc: FC<{ toc: Post['toc'] }> = ({ toc }) => {
  const { id } = useAnchor()
  return (
    <ul className="pl-md">
      {toc.map(t => (
        <li key={t.text}>
          <a
            href={'#' + t.text}
            className={cls('inline-block mb-sm text-$T0 hover:text-$PR0', {
              active: id === t.text,
            })}
          >
            {t.text}
          </a>
          {Boolean(t.children.length) && <PostToc toc={t.children} />}
        </li>
      ))}
    </ul>
  )
}

const PostText: FC<{ data: Post }> = ({ data }) => {
  return (
    <PostTextWrap>
      <AnchorContext.Provider>
        <div className="post-text-html">
          <PostHtml data={data} />
        </div>
        <div className="post-text-toc text-base pl-md sticky flex-shrink-0">
          <PostToc toc={data.toc} />
        </div>
      </AnchorContext.Provider>
    </PostTextWrap>
  )
}

export default PostText
