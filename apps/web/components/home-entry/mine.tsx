import React from 'react';

import styles from './styles.module.scss';

const Mine = () => {
  return (
    <div className={styles['home-mine']}>
      <div className={styles['my-name']}>
        <span>J</span>
        <span>U</span>
        <span>L</span>
        <span>Y</span>
      </div>
    </div>
  );
};

export { Mine };
