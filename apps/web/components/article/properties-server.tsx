import React from 'react';

import { NotionPagePropertyTitle, NotionPagePropertyDate } from '@july_cm/rc-notion';

import styles from './styles.module.scss';
import { getPageProperties } from '../../utils/get-page-properties';
import { fetchPage } from '../../utils/notion-client';

type PropertiesServerProps = {
  id: string;
};

const PropertiesServer: React.FC<PropertiesServerProps> = async ({ id }) => {
  const page = await fetchPage(id);
  const { title, date } = getPageProperties(page);
  return (
    <div className={styles.properties}>
      <NotionPagePropertyDate property={date} className={styles.date} />
      <NotionPagePropertyTitle property={title} className={styles.title} />
    </div>
  );
};

export { PropertiesServer };
