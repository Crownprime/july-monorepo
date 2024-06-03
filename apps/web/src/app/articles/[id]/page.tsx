import React, { Suspense } from 'react';

import { NotionRender } from '@july_cm/rc-notion';
import Link from 'next/link';

import styles from './page.module.scss';
import { ArticleProperties, PropertiesSkeleton, ContentSkeleton } from '../../../components/article';
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
          <NotionRender id={id} />
        </Suspense>
      </ArticleLayout>
    </div>
  );
};

export default Page;
