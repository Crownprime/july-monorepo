import { FC } from 'react'
import PostContent, { PostHead } from '@/components/post-context'

const PostView: FC<{ data: Post }> = ({ data }) => {
  return (
    <main>
      <PostHead data={data} />
      <PostContent data={data} />
    </main>
  )
}

export default PostView
