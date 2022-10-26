import styled from 'styled-components'

export const ImagePreviewWrap = styled.div`
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: white;
  padding: 50px;
  z-index: 99;
  > .image-wrap {
    position: relative;
    width: 100%;
    height: 100%;
  }
  > .control-wrap {
    position: absolute;
    top: 0;
    right: 0;
    padding: 24px;
  }
`
