import React from 'react';

import { Tag } from '@july_cm/rc-design';
import cls from 'classnames';

import { NotionPageProperty } from '../../types';

import './index.scss';

type MultiTagsProps = {
  property: NotionPageProperty.MultiSelect;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const MultiTags: React.FC<MultiTagsProps> = ({ property, className, ...props }) => {
  const { multi_select: multi } = property;
  return (
    <div className={cls('jmd-notion-multi-tags', className)} {...props}>
      {multi.map((i) => (
        <Tag>{i.name}</Tag>
      ))}
    </div>
  );
};

export { MultiTags };
