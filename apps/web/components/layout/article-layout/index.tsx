import React from 'react';

import styles from './styles.module.scss';
import { Link } from '../../link';

const ArticleLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <div className={styles.back}>
        <Link href="/archives">back</Link>
      </div>
      <div className={styles['article-container']}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export { ArticleLayout };
