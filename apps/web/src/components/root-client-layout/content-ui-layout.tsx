'use client';

import React, { useState } from 'react';

import { useScroll, type ScrollData } from '@july_cm/rc-hooks';
import cls from 'classnames';
import styled from 'styled-components';

import { Header } from './header';

const prefixCls = 'layout';

const ContentUILayoutStyled = styled.div`
  height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  .${prefixCls}--headers {
    width: 100%;
    height: 60px;
    position: sticky;
    top: 0;
    background-color: #ffffff;
    &.${prefixCls}--scrolled {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1);
    }
  }
`;

export const ContentUILayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const handleScroll = (data: ScrollData) => {
    const top = data.offset.y;
    setScrolled(!!Math.round(top));
  };
  const [ref] = useScroll({
    onScroll: handleScroll,
    onScrollEnd: handleScroll,
  });
  return (
    <ContentUILayoutStyled ref={ref}>
      <div
        className={cls(`${prefixCls}--headers`, {
          [`${prefixCls}--scrolled`]: scrolled,
        })}
      >
        <Header />
      </div>
      {children}
    </ContentUILayoutStyled>
  );
};
