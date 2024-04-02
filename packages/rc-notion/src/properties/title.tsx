import React from 'react';

import { RichText } from '../materials/rich-text';

import type { NotionPageProperty } from '../types';

type TitleProps = {
  property: NotionPageProperty.Title;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const Title: React.FC<TitleProps> = ({ property, ...props }) => {
  const { title } = property;
  return (
    <div {...props}>
      {title.map((i) => (
        <RichText block={i} />
      ))}
    </div>
  );
};

export { Title };
