import { useState } from 'react'
import styled from 'styled-components'
import { animated, useSpring, SpringRef } from 'react-spring'

// write word 动作在一帧中所占比例（剩余时间即为停顿时间）
const WRITE_TIMING = 0.1
// 根据帧头、帧尾，得到本帧 write action 完成的时间
const getWriteTime = (prev: number, next: number) => {
  return prev + (next - prev) * WRITE_TIMING
}

// 获得时间轴
const FRAME_LEN = 1
const FRAME_ECHO_LEN = 1
const FRAME_SLEEP = 3
type Mode = 'w' | 'd' | 's'
type GetWriteTimeLine = (
  prev: number,
  next: number,
  mode?: Mode,
  last?: number,
) => {
  range: number[]
  echo: number[]
  last: number
}
const getWriteTimeLine: GetWriteTimeLine = (
  prev,
  next,
  mode = 'w',
  last = 0,
) => {
  const range: number[] = []
  const echo: number[] = []
  let nLast = last
  const getLast = (i: number, mode: Mode) => {
    switch (mode) {
      case 'w':
        return i + FRAME_ECHO_LEN
      case 'd':
        return i - FRAME_ECHO_LEN
      case 's':
        return i
    }
  }
  for (let k = prev; k < next; k++) {
    range.push(k, getWriteTime(k, k + FRAME_LEN))
    echo.push(nLast, (nLast = getLast(nLast, mode)))
  }
  return {
    range,
    echo,
    last: nLast,
  }
}

type Action = (prev: number) => { end: number; mode: Mode }
const timeGenerator = (actions: Action[]) => {
  let prev = 0,
    step = null
  const range = [],
    echo = [],
    history = [prev]
  actions.forEach(action => {
    const { end, mode } = action(prev)
    step = getWriteTimeLine(prev, end, mode, step?.last || 0)
    range.push(...step.range)
    echo.push(...step.echo)
    history.push(end)
    prev = end
  })
  range.push(prev)
  echo.push(step.last)
  return {
    range,
    echo,
    history,
    last: prev,
  }
}

const getCommon = (words1: string, words2 = '') => {
  const arr1 = words1.split('')
  const arr2 = words2.split('')
  const minLen = Math.min(arr1.length, arr2.length)
  let i = 0
  while (i < minLen) {
    if (arr1[i] !== arr2[i]) {
      break
    }
    i++
  }
  return i
}

const WriteTextWrap = styled.span`
  display: flex;
  align-items: center;
  .text {
    color: ${props => props.theme.$T0};
    overflow: hidden;
    white-space: nowrap;
    width: 0;
    font-family: monospace;
  }
`
const WriteText: React.FC<{
  prime: string
  final?: string
  aRef?: SpringRef
  isEndWhenFinish?: boolean
}> = ({ prime, final, isEndWhenFinish, aRef }) => {
  const common = getCommon(prime, final)
  const del = prime.length - common
  const add = final ? final.length - common : 0
  const actions: Action[] = [
    prev => ({ end: prev + FRAME_SLEEP, mode: 's' }),
    prev => ({ end: prev + prime.length, mode: 'w' }),
  ]
  if (final) {
    actions.push(
      ...([
        prev => ({ end: prev + FRAME_SLEEP, mode: 's' }),
        prev => ({ end: prev + del, mode: 'd' }),
        prev => ({ end: prev + FRAME_SLEEP, mode: 's' }),
        prev => ({ end: prev + add, mode: 'w' }),
        prev => ({ end: prev + FRAME_SLEEP, mode: 's' }),
      ] as Action[]),
    )
  }
  const { range, echo: output, last, history } = timeGenerator(actions)

  const [words, setWords] = useState(prime)
  const [cursor, setCursor] = useState(false)
  const { width } = useSpring({
    config: { duration: last * 150 },
    from: { width: 0 },
    to: { width: last },
    ref: aRef,
    onStart() {
      setCursor(true)
    },
    onChange({ value }) {
      if (Math.floor(value.width) === history[4]) {
        setWords(final)
      }
      if (value.width === last) {
        if (isEndWhenFinish) {
          setCursor(false)
        }
      }
    },
  })
  return (
    <WriteTextWrap>
      <animated.div
        className="text text-xl"
        style={{ width: width.to({ range, output }).to(w => `${w}ch`) }}
      >
        {words}
      </animated.div>
      {cursor && <Cursor />}
    </WriteTextWrap>
  )
}

const CursorWrap = styled(animated.div)`
  width: 0.1em;
  height: 20px;
  background: ${props => props.theme.$T0};
`

const Cursor = () => {
  const style = useSpring({
    loop: true,
    config: { duration: 800 },
    from: { opacity: 1 },
    to: { opacity: 0 },
  })
  return <CursorWrap style={style} />
}

export default WriteText
