import React from 'react'
import { GetStaticProps } from 'next'
import { fetchCategoryPosts } from 'apis'
import CategoryView from '@/features/category'
import DocHead from '@/components/doc-head'
import Header from '@/components/header'
import Footer from '@/components/footer'

export const getStaticProps: GetStaticProps = async () => {
  const posts = fetchCategoryPosts()
  return {
    props: {
      posts
    }
  }
}

const CategoryPage: React.FC<{ posts: Post[] }> = ({ posts }) => {
  return (
    <div>
      <DocHead title="July's Site" />
      <Header />
      <CategoryView posts={posts} />
      <Footer />
    </div>
  )
}

export default CategoryPage
