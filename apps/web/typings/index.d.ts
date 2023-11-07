declare type PostMeta = {
  title: string
  sub?: string
  date: string
  status: string
  tags: string[] | null
}

declare type Post = PostMeta & {
  id: string
  content: string
  toc: TOCNode[]
  introduction: string
}

declare type TOCNode = {
  depth: number
  text: string
  children: TOCNode[]
}
