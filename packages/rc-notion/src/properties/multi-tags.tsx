import React from 'react';

import { Tag } from '@july_cm/rc-design';

import { NotionPageProperty } from '../types';

type MultiTagsProps = {
  property: NotionPageProperty.MultiSelect;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const MultiTags: React.FC<MultiTagsProps> = ({ property, ...props }) => {
  const { multi_select: multi } = property;
  return (
    <div {...props}>
      {multi.map((i) => (
        <Tag>{i.name}</Tag>
      ))}
    </div>
  );
};

export { MultiTags };
