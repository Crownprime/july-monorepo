'use client';

import React from 'react';

// import { client } from '@july_cm/web-articles/client';
import { type Article } from '@july_cm/web-articles';
import dayjs from 'dayjs';
import Link from 'next/link';
import styled from 'styled-components';

import { Introduction } from './introduction';

const prefixCls = 'articles';

const ArticleListStyled = styled.div`
  margin: 0 auto;
  max-width: 860px;
  & > :not(:first-child) {
    margin-top: 40px;
  }
  .${prefixCls}--item {
    padding: 24px;
    border-radius: 8px;
    &:hover {
      background-color: rgba(248, 250, 252, 0.7);
    }
    .${prefixCls}--title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
      a {
        color: rgb(15, 23, 42);
        text-decoration: none;
      }
    }
    .${prefixCls}--date {
      font-size: 14px;
      color: rgb(94, 104, 126);
    }
  }
`;

export const ArticleList: React.FC<React.PropsWithChildren<{ articles: Article[] }>> = ({ articles }) => {
  // const
  return (
    <ArticleListStyled>
      {articles.map((article) => (
        <div key={article.id} className={`${prefixCls}--item`}>
          <div className={`${prefixCls}--title`}>
            <Link href={`/articles/${article.id}`}>{article.meta.title}</Link>
          </div>
          <div className={`${prefixCls}--date`}>{dayjs(article.meta.date).format('MMMM D, YYYY')}</div>
          <div>
            <Introduction article={article} />
          </div>
        </div>
      ))}
    </ArticleListStyled>
  );
};
