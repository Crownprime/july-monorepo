import React, { Suspense } from 'react';

import Link from 'next/link';

import styles from './page.module.scss';
import {
  ArticleProperties,
  ArticleBlocks,
  PropertiesSkeleton,
  ContentSkeleton,
} from '../../../components/article';
import { ArticleLayout } from '../../../components/layout';

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
      <ArticleLayout>
        <Suspense fallback={<PropertiesSkeleton />}>
          <ArticleProperties id={id} />
        </Suspense>
        <Suspense fallback={<ContentSkeleton />}>
          <ArticleBlocks id={id} />
        </Suspense>
      </ArticleLayout>
    </div>
  );
};

export default Page;
