import React, { cache } from 'react';

import { server } from '@july_cm/web-articles';

import { ArticleList } from '../../components/article-list';

const getArticles = cache(() => server().filterByPublished().sortByDate().value);

const Page: React.FC = async () => {
  const list = getArticles();
  return <ArticleList articles={list} />;
};

export default Page;
