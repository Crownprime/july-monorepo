import React from 'react';

import { RichText } from './rich-text';

import type { RichTextItemResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type DescriptionProperty = {
  type: 'rich_text';
  rich_text: RichTextItemResponse[];
};

type DescriptionProps = {
  page: PageObjectResponse;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const PropertyDescription: React.FC<DescriptionProps> = ({ page, ...props }) => {
  const description = (page.properties.Description as DescriptionProperty).rich_text;
  return (
    <div {...props}>
      {description.map((i) => (
        <RichText block={i} />
      ))}
    </div>
  );
};

export { PropertyDescription };
