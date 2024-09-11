import React from 'react';

import { RichText } from './rich-text';

import type { RichTextItemResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type TitleProperty = {
  type: 'title';
  title: RichTextItemResponse[];
};

type TitleProps = {
  page: PageObjectResponse;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const PropertyTitle: React.FC<TitleProps> = ({ page, ...props }) => {
  const title = (page.properties.Name as TitleProperty).title;
  return (
    <div {...props}>
      {title.map((i) => (
        <RichText block={i} />
      ))}
    </div>
  );
};

export { PropertyTitle };
