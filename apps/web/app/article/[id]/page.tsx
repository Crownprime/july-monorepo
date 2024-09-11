import React, { Suspense } from 'react';

import { NotionRender } from '@july_cm/rc-notion';

import { ArticleProperties, PropertiesSkeleton, ContentSkeleton } from '../../../components/article';
import { ArticleLayout, WebLayout } from '../../../components/layout';
interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  const { id } = params;

  return (
    <WebLayout>
      <ArticleLayout>
        <Suspense fallback={<PropertiesSkeleton />}>
          <ArticleProperties id={id} />
        </Suspense>
        <Suspense fallback={<ContentSkeleton />}>
          <NotionRender id={id} />
        </Suspense>
      </ArticleLayout>
    </WebLayout>
  );
};

export default Page;
