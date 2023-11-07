import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { crateTOCTree, getFirstParagraph } from 'utils'

const postsDirectory = path.join(process.cwd(), 'posts')

const getPostById = (id: string): Post => {
  // 完整路径
  const fullPath = path.join(postsDirectory, `${id}.md`)
  // 数据流
  const contents = fs.readFileSync(fullPath, 'utf8')
  // 获得 meta 头和内容
  const { data: meta, content } = matter(contents)
  let { tags } = meta
  tags = tags ? tags.split(',') : null
  // 获取深度为 2 的 toc
  const { children: tree } = remark()
    .use(remarkHtml)
    .parse(content)
  const toc = crateTOCTree(tree, 2)
  // 获得首段内容
  const introduction = getFirstParagraph(tree) || ''
  return {
    ...(meta as PostMeta),
    tags,
    id,
    content,
    toc,
    introduction
  }
}

/******************************************************************
 * 获取 post 列表，并且按照 date 排序
 */
const getPosts = () => {
  const fileNames = fs.readdirSync(postsDirectory)

  return fileNames
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '')
      return getPostById(id)
    })
    .filter((post) => post.status !== 'draft')
}

export const fetchCategoryPosts = () => {
  return getPosts()
    .filter((post) => post.status !== 'draft')
    .sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1))
    .map(({ id, title, sub = null, date, tags, introduction }) => ({
      id,
      title,
      sub,
      date,
      tags,
      introduction
    }))
}

// 获取全量 post id
export const fetchPostIds = () => {
  return getPosts().map((p) => p.id)
}

/***********************************************************************
 * 根据 id 获取 post 信息
 */
export const fetchPostById = (id: string) => {
  return getPostById(id)
}
