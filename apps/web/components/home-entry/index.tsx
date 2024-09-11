import React from 'react';

import { Mine } from './mine';
import { Navigation } from './navigation';
import styles from './styles.module.scss';

export const HomeEntry: React.FC = () => {
  return (
    <div className={styles['home-page']}>
      <Mine />
      <Navigation />
    </div>
  );
};
