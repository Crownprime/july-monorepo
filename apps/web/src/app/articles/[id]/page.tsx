import React, { Suspense } from 'react';

import Link from 'next/link';

import styles from './page.module.scss';
import { ArticleProperties, ArticleBlocks } from '../../../components/article';

interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  const { id } = params;

  return (
    <div>
      <div className={styles['back']}>
        <Link href="/articles">back</Link>
      </div>
      <div className={styles['article-content']}>
        <Suspense fallback="loading....">
          <ArticleProperties id={id} />
        </Suspense>
        <Suspense fallback="loading....">
          <ArticleBlocks id={id} />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
