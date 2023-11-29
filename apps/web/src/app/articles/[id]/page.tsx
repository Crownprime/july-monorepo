import React from 'react';

import { server } from '@july_cm/web-articles';
import { MDXRemote } from 'next-mdx-remote/rsc';

interface PageProps {
  params: {
    id: string;
  };
}

const generateStaticParams = () => {
  return server()
    .filterByPublished()
    .value.map((i) => ({ id: i.id }));
};

const Page: React.FC<PageProps> = ({ params }) => {
  const article = server().filterById(params.id).one;

  return (
    <div>
      <MDXRemote source={article.content} />
    </div>
  );
};

export default Page;

export { generateStaticParams };
