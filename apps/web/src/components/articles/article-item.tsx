import React from 'react';

import {
  NotionPagePropertyTitle,
  NotionPagePropertyDescription,
  NotionPagePropertyDate,
  NotionPagePropertyMultiTags,
} from '@july_cm/rc-notion';
import Link from 'next/link';

import styles from './styles.module.scss';
import { getPageProperties } from '../../utils/get-page-properties';

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type ArticleItemProps = {
  article: PageObjectResponse;
};

const ArticleItem: React.FC<ArticleItemProps> = ({ article }) => {
  const { id } = article;

  const { title, description, tags, date } = getPageProperties(article);

  return (
    <Link className={styles['article-item']} href={`/articles/${id}`}>
      <div className={styles['article-date']}>
        <NotionPagePropertyDate property={date} />
      </div>
      <NotionPagePropertyTitle className={styles['article-title']} property={title} />
      <NotionPagePropertyDescription className={styles['article-description']} property={description} />
      <div className={styles['article-properties']}>
        <NotionPagePropertyMultiTags property={tags} />
      </div>
    </Link>
  );
};

export { ArticleItem };
