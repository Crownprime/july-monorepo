import { FC } from 'react'
import styled from 'styled-components'
import Container from '@/components/layout/container'
import { TagSpace, MarkTag, DateTag } from '@/components/tag'
import { HEADER_HEIGHT } from '@/constants/header'

const PostHeadWrap = styled.div`
  margin-top: ${HEADER_HEIGHT}px;
  padding-top: ${(props) => props.theme.$md};
  .post-title {
    font-size: 30px;
    color: ${(props) => props.theme.$N600};
  }
  .post-sub {
    font-size: 14px;
    line-height: 24px;
    background: ${(props) => props.theme.$N100};
    padding: ${(props) => props.theme.$sm};
    border-radius: ${(props) => props.theme.$mn};
    color: ${(props) => props.theme.$N400};
    margin-top: ${(props) => props.theme.$md};
  }
  .post-tips {
    margin-top: ${(props) => props.theme.$md};
    .tip {
      margin-top: ${(props) => props.theme.$mn};
    }
  }
`

export const PostHeadStyled: FC<{
  title: string
  date: string
  sub?: string
  tags?: string[] | null
}> = ({ title, date, sub, tags = [] }) => {
  return (
    <PostHeadWrap>
      <Container>
        <div className="post-title">{title}</div>
        {Boolean(sub) && <div className="post-sub">「 {sub} 」</div>}
        <div className="post-tips">
          <div className="tip date">
            <DateTag text={date} />
          </div>
          {Boolean(tags?.length) && (
            <div className="tip tags">
              <TagSpace>
                {(tags || []).map((tag) => (
                  <MarkTag key={tag} text={tag} />
                ))}
              </TagSpace>
            </div>
          )}
        </div>
      </Container>
    </PostHeadWrap>
  )
}

export const PostTextWrap = styled.div`
  display: flex;
  align-items: flex-end;
  .post-text-html {
    width: 100%;
    h2 {
      font-size: 18px;
      line-height: 24px;
      padding-top: ${(props) => props.theme.$sm};
      margin: ${(props) => props.theme.$lg} 0 ${(props) => props.theme.$md} 0;
      &::before {
        content: '##';
        color: ${(props) => props.theme.$RP0};
        padding-right: ${(props) => props.theme.$sm};
      }
    }
    h3 {
      font-size: 16px;
      line-height: 22px;
      margin: ${(props) => props.theme.$md} 0 ${(props) => props.theme.$mn} 0;
      &::before {
        content: '###';
        color: ${(props) => props.theme.$RP0};
        padding-right: ${(props) => props.theme.$sm};
      }
    }
    blockquote {
      border-left: 3px solid ${(props) => props.theme.$RP0};
      padding-left: 8px;
      p {
        color: ${(props) => props.theme.$T1};
      }
    }
  }
`
