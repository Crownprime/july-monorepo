import cls from 'classnames'
import React from 'react'
import styled from 'styled-components'

const CodeTargetStyled = styled.code`
  &.inline {
    padding: ${(props) => props.theme.$ii} ${(props) => props.theme.$sm};
    border-radius: ${(props) => props.theme.$mn};
    font-size: 14px;
    line-height: inherit;
  }
`

export const CodeTarget: React.FC<{
  inline?: boolean
  className?: string
  children: React.ReactNode | React.ReactNode[]
}> = ({ className, inline, children }) => {
  return (
    <CodeTargetStyled className={cls(className, 'language-', { inline })}>
      {children}
    </CodeTargetStyled>
  )
}
