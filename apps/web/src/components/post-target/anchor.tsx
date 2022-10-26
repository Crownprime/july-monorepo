import styled from 'styled-components'
import { NearMeIcon } from '@/components/icons'

const ATargetStyled = styled.a`
  color: ${props => props.theme.$RP0};
  &:hover {
    text-decoration: underline;
  }
`

export const ATarget: React.FC<{ href?: string }> = ({ href, children }) => {
  return (
    <ATargetStyled href={href} className="px-mn" target="_blank">
      <NearMeIcon className="pr-ii" />
      {children}
    </ATargetStyled>
  )
}
