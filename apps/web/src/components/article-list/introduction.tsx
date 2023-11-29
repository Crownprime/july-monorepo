import React from 'react';

import { remarkIntroduction } from '@july_cm/remark-introduction';
import { type Article } from '@july_cm/web-articles';
import { MDXRemote } from 'next-mdx-remote/rsc';

export const Introduction: React.FC<React.PropsWithChildren<{ article: Article }>> = async ({ article }) => {
  return (
    <MDXRemote
      source={article.content}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkIntroduction],
        },
      }}
    />
  );
};
