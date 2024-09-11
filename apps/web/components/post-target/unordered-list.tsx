import styled from 'styled-components'

export const UlTarget = styled.ul`
  padding-left: 8px;
  > li {
    margin: 0;
    position: relative;
    padding-left: 20px;
    font-size: 16px;
    line-height: 26px;
    color: ${(props) => props.theme.$T0};
    &::before {
      position: absolute;
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 6px;
      background: ${(props) => props.theme.$RP0};
      left: 5px;
      top: 10px;
    }
  }
`
