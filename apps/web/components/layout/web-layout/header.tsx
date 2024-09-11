import React from 'react';

import cls from 'classnames';

import styles from './styles.module.scss';
import { Link } from '../../link';

const Header: React.FC<{ floating: boolean }> = ({ floating }) => {
  return (
    <div
      className={cls(styles['web-header'], {
        [styles['web-header--floating']]: floating,
      })}
    >
      <div></div>
      <div className={styles['header-search']}></div>
      <div className={styles['header-nav']}>
        <Link href="/">home</Link>
        <Link href="/archives">archives</Link>
      </div>
    </div>
  );
};

export { Header };
