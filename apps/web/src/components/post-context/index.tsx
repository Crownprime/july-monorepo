import { FC } from 'react'
import Container from '@/components/layout/container'
import PostText from './post-text'

const PostContext: FC<{ data: Post }> = ({ data }) => {
  return (
    <Container>
      <PostText data={data} />
    </Container>
  )
}

export { default as PostHead } from './post-head'
export default PostContext
