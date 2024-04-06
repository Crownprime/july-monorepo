import React, { Suspense } from 'react';

import styles from './page.module.scss';
import { Articles, Skeleton } from '../../components/articles';

const Page: React.FC = () => {
  return (
    <div className={styles['articles']}>
      <Suspense fallback={<Skeleton />}>
        <Articles />
      </Suspense>
    </div>
  );
};

export default Page;
