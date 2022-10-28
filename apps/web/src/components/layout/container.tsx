import React, { PropsWithChildren } from 'react'
import cls from 'classnames'
import theme from '@/styles/theme'

export const Container: React.FC<PropsWithChildren<{
  className?: string
}>> = ({ children, className }) => {
  return (
    <div className={cls('layout-container', className)}>
      {children}
      <style jsx>{`
        .layout-container {
          margin: 0 auto;
          width: 980px;
        }
        @media screen and (max-width: 1040px) {
          .layout-container {
            width: 100%;
            padding: 0 ${theme.$lg};
          }
        }
      `}</style>
    </div>
  )
}

export default Container
