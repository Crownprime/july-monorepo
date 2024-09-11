import React, { Suspense } from 'react';

import { ArchivesServer } from './server';
import { Skeleton } from './skeleton';
import styles from './styles.module.scss';

const Archives: React.FC = () => {
  return (
    <div className={styles['archives']}>
      <Suspense fallback={<Skeleton />}>
        <ArchivesServer />
      </Suspense>
    </div>
  );
};

export { Archives };
