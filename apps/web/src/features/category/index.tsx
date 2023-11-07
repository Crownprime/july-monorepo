import React from 'react'
import PostTimeLine from '@/components/post-time-line'

const Category: React.FC<{ posts: Post[] }> = ({ posts }) => {
  return (
    <div className="pt-[80px] min-h-[100vh]">
      <PostTimeLine posts={posts} />
    </div>
  )
}

export default Category
