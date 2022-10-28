import { FC, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ImagePreviewWrap } from './style'
import { CloseIcon } from '@/components/icons'

const ImagePreview: FC<{ src: string; alt: string; onClose?: () => void }> = ({
  onClose,
  ...prop
}) => {
  const handleClose: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    onClose?.()
  }
  return createPortal(
    <ImagePreviewWrap>
      <div className="control-wrap text-4xl" onClick={handleClose}>
        <CloseIcon />
      </div>
      <div className="image-wrap">
        <Image {...prop} fill={true} />
      </div>
    </ImagePreviewWrap>,
    document.body
  )
}

export const ImgTarget: FC<{ src?: string; alt?: string }> = ({
  src,
  alt = '',
  ...props
}) => {
  const [preview, setPreview] = useState(false)
  const handleClick = (val: boolean) => {
    setPreview(val)
  }
  if (!src) {
    return null
  }
  return (
    <span className="flex justify-center" onClick={() => handleClick(true)}>
      <Image src={src} alt={alt} {...props} width="700" height="300" />
      {preview && (
        <ImagePreview
          src={src}
          alt={alt}
          {...props}
          onClose={() => handleClick(false)}
        />
      )}
    </span>
  )
}
