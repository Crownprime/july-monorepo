import { useRef, useState } from 'react'
import styled from 'styled-components'
import { useSpring, animated } from '@react-spring/web'
import { useEffect } from 'react'

const WIDTH = 138
const CIRCLE_WIDTH = 30
const HoverButtonStyled = styled.div`
  width: ${WIDTH}px;
  height: ${CIRCLE_WIDTH}px;
  position: relative;
  cursor: pointer;
  .circle {
    overflow: hidden;
    position: absolute;
    height: ${CIRCLE_WIDTH}px;
    background: ${props => props.theme.$T0};
    border-radius: ${CIRCLE_WIDTH}px;
    display: flex;
    align-items: center;
    .arrow {
      flex: 0;
      left: 18px;
      position: absolute;
      height: 2px;
      background: ${props => props.theme.$W0};
      border-top-right-radius: 100%;
      border-bottom-right-radius: 100%;
      &::before {
        opacity: 1 !important;
        position: absolute;
        content: '';
        top: -4px;
        right: 0;
        width: 10px;
        height: 10px;
        border-top: 2px solid ${props => props.theme.$W0};
        border-right: 2px solid ${props => props.theme.$W0};
        transform: rotate(45deg);
      }
    }
    .text {
      color: ${props => props.theme.$W0};
    }
  }
  .text {
    font-size: 14px;
    line-height: ${CIRCLE_WIDTH}px;
    flex: 0;
    white-space: nowrap;
    padding-left: ${CIRCLE_WIDTH + 12}px;
  }
`

const HoverButton: React.FC<{
  onClick?: () => void
}> = ({ onClick }) => {
  const ref = useRef<HTMLDivElement>()
  const [active, setActive] = useState(false)
  const props = useSpring({ width: active ? WIDTH : CIRCLE_WIDTH })
  const arrowProps = useSpring({
    width: active ? 16 : 0,
    left: active ? 10 : 18,
    clamp: true,
  })
  useEffect(() => {
    const activeOn = () => {
      setActive(true)
    }
    const blurOn = () => {
      setActive(false)
    }
    ref.current?.addEventListener('mouseover', activeOn)
    ref.current?.addEventListener('mouseout', blurOn)
    return () => {
      ref.current?.removeEventListener('mouseover', activeOn)
      ref.current?.removeEventListener('mouseout', blurOn)
    }
  }, [])
  return (
    <HoverButtonStyled ref={ref} onClick={onClick}>
      <div className="flex items-center">
        <animated.span className="circle" style={props}>
          <animated.span className="arrow" style={arrowProps}></animated.span>
          <div className="text">READ MORE</div>
        </animated.span>
        <div className="text">READ MORE</div>
      </div>
    </HoverButtonStyled>
  )
}

export default HoverButton
