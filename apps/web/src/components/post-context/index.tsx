import { FC } from 'react'
import { ScrollableAnchorProvider } from '@july_cm/react-lib'
import Container from '@/components/layout/container'
import PostText from './post-text'

const PostContext: FC<{ data: Post }> = ({ data }) => {
  return (
    <ScrollableAnchorProvider initialState={data.toc}>
      <Container>
        <PostText data={data} />
      </Container>
    </ScrollableAnchorProvider>
  )
}

export { default as PostHead } from './post-head'
export default PostContext
