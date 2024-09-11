import React from 'react';

import { ArticleItem } from './article-item';
import { clientAPI } from '../notion/client';

const ArchivesServer: React.FC = async () => {
  const articles = await clientAPI.fetchPageList();
  return articles.map((a) => <ArticleItem article={a} />);
};

export { ArchivesServer };
