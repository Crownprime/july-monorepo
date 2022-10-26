import { useMemo } from 'react'
import Link from 'next/link'
import Container from '@/components/layout/container'
import { TagSpace, MarkTag, DateTag } from '@/components/tag'
import { getYearByTimestamp, getMonthAndDayByTimestamp } from '@/lib'
import { NUM_2_ZH } from '@/constants'
import { TimeLineStyled } from './styled'

const PostTimePoint: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="post">
      <div className="echo-content">
        <div className="title truncate">
          <span className="text-lg cursor-pointer">
            <Link href={'/post/' + post.id}>{post.title}</Link>
          </span>
        </div>
        <span className="date">
          <DateTag text={getMonthAndDayByTimestamp(post.date)} />
        </span>
      </div>
      <div className="hide-content pl-sm pt-sm">
        {Boolean(post.sub) && (
          <div className="sub-title text-$T1 text-base mb-mn">
            「{post.sub}」
          </div>
        )}
        <div className="text-$T1 text-base introduction">
          {post.introduction}
        </div>
        {Boolean(post.tags?.length) && (
          <div className="mt-mn">
            <TagSpace>
              {post.tags.map(tag => (
                <MarkTag key={tag} text={tag} />
              ))}
            </TagSpace>
          </div>
        )}
      </div>
    </div>
  )
}

const YearBlock: React.FC<{ year: string }> = ({ year }) => {
  const echoYear = useMemo(
    () =>
      year
        .split('')
        .map(i => NUM_2_ZH[i] || i)
        .join(''),
    [year],
  )
  return <div className="year text-xl">{echoYear}</div>
}

const YearTimePoint: React.FC<{
  year: string
  data: Post[]
}> = ({ year, data }) => {
  return (
    <TimeLineStyled>
      <YearBlock year={year} />
      <div className="posts">
        {data.map(p => (
          <PostTimePoint post={p} key={p.id} />
        ))}
      </div>
    </TimeLineStyled>
  )
}

const PostTimeLine: React.FC<{
  posts: Post[]
}> = ({ posts }) => {
  const postGroupByYear = useMemo(() => {
    const years: string[] = []
    const map: Record<string, Post[]> = {}
    posts.forEach(p => {
      const year = getYearByTimestamp(p.date)
      if (map[year]) {
        map[year].push(p)
      } else {
        years.push(year)
        map[year] = [p]
      }
    })
    return { years, map }
  }, [posts])
  return (
    <Container>
      {postGroupByYear.years.map(y => (
        <YearTimePoint year={y} data={postGroupByYear.map[y] || []} key={y} />
      ))}
    </Container>
  )
}

export default PostTimeLine
