import React from 'react';

import { RichText } from '../materials/rich-text';

import type { NotionPageProperty } from '../types';

type DescriptionProps = {
  property: NotionPageProperty.Description;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const Description: React.FC<DescriptionProps> = ({ property, ...props }) => {
  const { rich_text: richText } = property;
  return (
    <div {...props}>
      {richText.map((i) => (
        <RichText block={i} />
      ))}
    </div>
  );
};

export { Description };
