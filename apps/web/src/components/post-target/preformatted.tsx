import styled from 'styled-components'

const PreTargetStyled = styled.div`
  border-radius: ${props => props.theme.$sm};
  overflow: hidden;
  position: relative;
  pre[class*='language-'] {
    margin: 0;
    padding-top: 44px;
  }
  .window-buttons {
    position: absolute;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    padding-left: 18px;
    span {
      width: 12px;
      height: 12px;
      border-radius: 12px;
      margin-right: 10px;
      &.r {
        background: #ff795d;
      }
      &.y {
        background: #f8e71c;
      }
      &.g {
        background: #44bfa3;
      }
    }
  }
`

export const PreTarget: React.FC = ({ children }) => {
  return (
    <PreTargetStyled className="text-base">
      <div className="window-buttons">
        <span className="r"></span>
        <span className="y"></span>
        <span className="g"></span>
      </div>
      <pre className="language-">{children}</pre>
    </PreTargetStyled>
  )
}
