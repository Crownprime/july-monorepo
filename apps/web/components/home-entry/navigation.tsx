import React from 'react';

import styles from './styles.module.scss';
import { Link } from '../link';

const NAVIGATION_LIST = [
  {
    label: 'archives',
    path: '/archives',
  },
  {
    label: 'tools',
    path: '/tools',
  },
  {
    label: 'abort me',
    path: '/abort',
  },
];

const Navigation: React.FC = () => {
  return (
    <ul className={styles['home-navigation']}>
      {NAVIGATION_LIST.map((navigation) => (
        <li key={navigation.path}>
          <Link href={navigation.path}>{navigation.label}</Link>
        </li>
      ))}
    </ul>
  );
};

export { Navigation };
