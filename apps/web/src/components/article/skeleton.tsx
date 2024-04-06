import { Skeleton as DSkeleton } from '@july_cm/rc-design';

import styles from './styles.module.scss';

const PropertiesSkeleton = () => {
  return (
    <div className={styles['properties-skeleton']}>
      <DSkeleton style={{ width: 200, marginBottom: 8 }} />
      <DSkeleton style={{ width: 500, height: 28, marginBottom: 8 }} />
    </div>
  );
};

const ContentSkeleton = () => {
  return (
    <div>
      <DSkeleton style={{ marginBottom: 8 }} />
      <DSkeleton style={{ marginBottom: 8 }} />
      <DSkeleton style={{ marginBottom: 8 }} />
      <DSkeleton style={{ marginBottom: 8 }} />
    </div>
  );
};

export { PropertiesSkeleton, ContentSkeleton };
