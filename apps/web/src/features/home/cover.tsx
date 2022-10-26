import { useRouter } from 'next/router'
import { useSpringRef, useChain } from 'react-spring'
import WriteText from '@/components/write-text'
import HoverButton from '@/components/hover-button'
import styled from 'styled-components'

const CoverStyled = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  .write-text {
    width: 300px;
  }
  .expand {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    padding-bottom: ${props => props.theme.$lg};
  }
`

const Cover = () => {
  const router = useRouter()
  const firstRef = useSpringRef()
  const secRef = useSpringRef()
  useChain([firstRef, secRef])
  const handleClick = () => {
    router.push('/category')
  }
  return (
    <CoverStyled className="h-screen">
      <div className="write-text">
        <WriteText
          prime="Hello, I am JiangXujin"
          final="Hello, I am July."
          isEndWhenFinish={true}
          aRef={firstRef}
        />
        <WriteText prime="Welcome to my website!" aRef={secRef} />
      </div>
      <div className="expand">
        <HoverButton onClick={handleClick} />
      </div>
    </CoverStyled>
  )
}

export default Cover
