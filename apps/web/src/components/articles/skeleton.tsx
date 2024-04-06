import { Skeleton as DSkeleton } from '@july_cm/rc-design';

import styles from './styles.module.scss';

const Skeleton = () => {
  return (
    <div className={styles['article-skeleton']}>
      <DSkeleton style={{ width: 200, marginBottom: 8 }} />
      <DSkeleton style={{ width: 500, height: 28, marginBottom: 8 }} />
      <DSkeleton style={{ marginBottom: 8 }} />
      <DSkeleton style={{ width: 100 }} />
    </div>
  );
};

export { Skeleton };
