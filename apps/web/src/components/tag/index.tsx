import { LoyaltyIcon, AlarmIcon } from '@/components/icons'
import styled from 'styled-components'

export const Tag: React.FC<{
  text?: string
  icon?: JSX.Element
}> = ({ text, icon }) => {
  return (
    <span className="tag text-sm text-$T0 hover:bg-$T5 px-mn py-ii rounded cursor-pointer inline-flex items-center">
      {icon}
      <span className="ml-mn">{text}</span>
    </span>
  )
}

export const DateTag = ({ text }: { text: string }) => (
  <Tag text={text} icon={<AlarmIcon />} />
)
export const MarkTag = ({ text }: { text: string }) => (
  <Tag text={text} icon={<LoyaltyIcon />} />
)

const TagsStyled = styled.div`
  display: inline-flex;
  .tag:not(:last-child) {
    margin-right: ${props => props.theme.$mn};
  }
`

export const TagSpace = TagsStyled

export default Tag
