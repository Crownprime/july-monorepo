import styled from 'styled-components'

const H1TargetStyled = styled.h1`
  color: ${(props) => props.theme.$T0};
  font-size: 18px;
  line-height: 26px;
  padding-bottom: ${(props) => props.theme.$mn};
  margin: 24px 0 16px 0;
  font-weight: 500;
  border-bottom: 1px dashed ${(props) => props.theme.$N300};
  &::before {
    content: '#';
    color: ${(props) => props.theme.$RP0};
    padding-right: ${(props) => props.theme.$sm};
  }
`

export const H1Target = H1TargetStyled
