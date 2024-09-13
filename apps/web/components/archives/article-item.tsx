import React from 'react';

import { Link } from '../link';

import styles from './styles.module.scss';
import { PropertyTitle, PropertyDescription, PropertyPublishDate, PropertyTags } from '../notion';

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type ArticleItemProps = {
  article: PageObjectResponse;
};

const ArticleItem: React.FC<ArticleItemProps> = ({ article }) => {
  const { id } = article;

  return (
    <div className={styles['article-item']}>
      <div className={styles['article-date']}>
        <PropertyPublishDate page={article} />
      </div>
      <Link href={`/article/${id}`}>
        <PropertyTitle className={styles['article-title']} page={article} />
      </Link>
      <PropertyDescription className={styles['article-description']} page={article} />
      <div className={styles['article-properties']}>
        <PropertyTags page={article} />
      </div>
    </div>
  );
};


export { ArticleItem };
