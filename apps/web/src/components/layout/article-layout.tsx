import React from 'react';

import styles from './styles.module.scss';
const ArticleLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles['article-layout']}>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export { ArticleLayout };
