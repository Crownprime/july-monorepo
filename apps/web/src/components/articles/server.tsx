import React from 'react';

import { ArticleItem } from './article-item';
import { fetchPageList } from '../../utils/notion-client';

const Server: React.FC = async () => {
  const articles = await fetchPageList();
  return articles.map((a) => <ArticleItem article={a} />);
};

export { Server };
