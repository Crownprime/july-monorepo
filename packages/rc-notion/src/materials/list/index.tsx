import React from 'react';

import cls from 'classnames';

import { RichText } from '../rich-text';

import type { NotionBlock } from '../../types';

import './index.scss';

type ListProps = {
  block: NotionBlock.List;
} & React.HTMLAttributes<HTMLDivElement>;

const List: React.FC<ListProps> = ({ block, className, ...props }) => {
  const { bulleted_list_item: item } = block;
  const { rich_text: text } = item;
  return (
    <div className={cls('jmd-notion-list', className)} {...props}>
      {text.map((t) => (
        <RichText block={t} key={t.plain_text} />
      ))}
    </div>
  );
};

export { List, type ListProps };
