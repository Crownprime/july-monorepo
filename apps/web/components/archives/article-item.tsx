import React from 'react';

import Link from 'next/link';

import styles from './styles.module.scss';
import { PropertyTitle, PropertyDescription, PropertyPublishDate, PropertyTags } from '../notion';

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type ArticleItemProps = {
  article: PageObjectResponse;
};

const ArticleItem: React.FC<ArticleItemProps> = ({ article }) => {
  const { id } = article;

  return (
    <Link className={styles['article-item']} href={`/article/${id}`}>
      <div className={styles['article-date']}>
        <PropertyPublishDate page={article} />
      </div>
      <PropertyTitle className={styles['article-title']} page={article} />
      <PropertyDescription className={styles['article-description']} page={article} />
      <div className={styles['article-properties']}>
        <PropertyTags page={article} />
      </div>
    </Link>
  );
};

export { ArticleItem };
