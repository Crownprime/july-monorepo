import { FC } from 'react'
import { head } from 'lodash-es'
import ReactMarkdown from 'react-markdown'
import { ScrollableAnchor } from '@july_cm/react-lib'
import {
  PreTarget,
  CodeTarget,
  ATarget,
  ImgTarget,
  H1Target,
  PTarget,
  UlTarget
} from '@/components/post-target'
import { PostToc } from '@/components/post-toc'
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

const PostText: FC<{ data: Post }> = ({ data }) => {
  return (
    <PostTextWrap>
      <div className="post-text-html">
        <PostHtml data={data} />
      </div>
      <PostToc toc={data.toc} />
    </PostTextWrap>
  )
}

export default PostText
