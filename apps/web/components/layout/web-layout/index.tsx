'use client';

import React, { useState } from 'react';

import { useScroll, type ScrollData } from '@july_cm/rc-hooks';

import { Footer } from './footer';
import { Header } from './header';
import styles from './styles.module.scss';

export const WebLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [floating, setFloating] = useState(false);
  const handleScroll = (data: ScrollData) => {
    const top = data.offset.y;
    setFloating(!!Math.round(top));
  };
  const [ref] = useScroll({
    onScroll: handleScroll,
    onScrollEnd: handleScroll,
  });
  return (
    <div ref={ref} className={styles['web-layout']}>
      <Header floating={floating} />
      {children}
      <Footer />
    </div>
  );
};
