import { forwardRef } from 'react'
import styled from 'styled-components'
import Container from '@/components/layout/container'
import { HEADER_HEIGHT } from '@/constants/header'

export const MenuItemStyled = forwardRef<
  HTMLDivElement,
  {
    icon: JSX.Element
    text: string
    onClick?: () => void
  }
>(({ icon, text, onClick }, ref) => {
  return (
    <div className="menu-item text-base" onClick={onClick} ref={ref}>
      <div className="menu-icon mr-mn">{icon}</div>
      <span className="menu-text">{text}</span>
    </div>
  )
})

const HeaderWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: ${HEADER_HEIGHT}px;
  background: ${props => props.theme.$W0};
  box-shadow: 0 0 ${props => props.theme.$mn} 0 ${props => props.theme.$T2};
  z-index: 10;
  transition: all 0.4s;
  .header-menus {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    .menu-item {
      width: 60px;
      cursor: pointer;
      color: ${props => props.theme.$T0};
      margin-right: ${props => props.theme.$lg};
      display: flex;
      align-items: center;
      overflow: hidden;
      transition: all 0.2s;
      &:hover {
        color: ${props => props.theme.$RP0};
      }
      .menu-text {
        white-space: nowrap;
      }
    }
  }
`

export const HeaderStyled = ({ children }) => {
  return (
    <HeaderWrap>
      <Container className="h-full">
        <div className="header-menus">{children}</div>
      </Container>
    </HeaderWrap>
  )
}

export default HeaderStyled
