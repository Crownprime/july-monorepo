import React from 'react';

import { Tag } from '@july_cm/rc-design';
import cls from 'classnames';

import styles from './styles.module.scss';

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type TagsProperty = {
  type: 'multi_select';
  multi_select: {
    id: string;
    name: string;
  }[];
};

type PropertyTagsProps = {
  page: PageObjectResponse;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const PropertyTags: React.FC<PropertyTagsProps> = ({ page, className, ...props }) => {
  const tags = (page.properties.Tags as TagsProperty).multi_select;
  return (
    <div className={cls(styles['property-tags'], className)} {...props}>
      {tags.map((i) => (
        <Tag>{i.name}</Tag>
      ))}
    </div>
  );
};

export { PropertyTags };
