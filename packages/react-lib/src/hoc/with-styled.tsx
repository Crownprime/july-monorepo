import styled, { FlattenSimpleInterpolation } from 'styled-components'

export const withStyled = <Props,>(
  el: React.FC<Props>,
  styles: FlattenSimpleInterpolation
) => styled(el)`
  ${styles}
`
