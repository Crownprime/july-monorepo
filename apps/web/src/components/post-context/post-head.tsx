import { FC } from 'react'
import { echoTime } from '@/lib'
import { PostHeadStyled } from './styled'

const PostHead: FC<{ data: Post }> = ({ data }) => {
  return (
    <PostHeadStyled
      title={data.title}
      sub={data.sub}
      date={echoTime(data.date)}
      tags={data.tags}
    />
  )
}

export default PostHead
