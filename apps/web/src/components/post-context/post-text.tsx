import { FC } from 'react'
import cls from 'classnames'
import { head } from 'lodash-es'
import ReactMarkdown from 'react-markdown'
import { ScrollableAnchor, useScrollableAnchorModel } from '@july_cm/react-lib'
import {
  PreTarget,
  CodeTarget,
  ATarget,
  ImgTarget,
  H1Target,
  PTarget,
  UlTarget
} from '@/components/post-target'
import { PostTextWrap } from './styled'

const PostHtml: FC<{ data: Post }> = ({ data }) => {
  return (
    <ReactMarkdown
      components={{
        h1({ children }) {
          const headText = head(children as string[]) || ''
          return (
            <ScrollableAnchor id={headText}>
              <H1Target>{headText}</H1Target>
            </ScrollableAnchor>
          )
        },
        h2({ children }) {
          return (
            <ScrollableAnchor id={head(children as string[]) || ''}>
              <h2>{head(children)}</h2>
            </ScrollableAnchor>
          )
        },
        p({ children, ...props }) {
          return <PTarget {...props}>{children}</PTarget>
        },
        ul({ children, ...props }) {
          return <UlTarget {...props}>{children}</UlTarget>
        },
        img: ImgTarget,
        pre: (props) => {
          return <PreTarget>{props.children}</PreTarget>
        },
        code: ({ children }) => {
          return <CodeTarget>{children}</CodeTarget>
        },
        a: ({ children, href }) => {
          return <ATarget href={href}>{children}</ATarget>
        }
      }}
    >
      {data.content}
    </ReactMarkdown>
  )
}

const PostToc: FC<{ toc: Post['toc'] }> = ({ toc }) => {
  const { active } = useScrollableAnchorModel()
  return (
    <ul className="pl-md">
      {toc.map((t) => (
        <li key={t.text}>
          <a
            href={'#' + t.text}
            className={cls('inline-block mb-sm text-$T0 hover:text-$PR0', {
              active: active === t.text
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
      <div className="post-text-html">
        <PostHtml data={data} />
      </div>
      <div className="post-text-toc text-base pl-md sticky flex-shrink-0">
        <PostToc toc={data.toc} />
      </div>
    </PostTextWrap>
  )
}

export default PostText
