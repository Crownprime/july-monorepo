import React, { HTMLAttributes } from 'react';

import cls from 'classnames';

import { client } from '../../client';
import { Code } from '../code';
import { Divider } from '../divider';
import { Heading } from '../heading';
import { Image } from '../image';
import { List } from '../list';
import { Paragraph } from '../paragraph';
import { Quote } from '../quote';

import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import './index.scss';

const NotionComponents: Partial<Record<BlockObjectResponse['type'], React.FC<any>>> = {
  paragraph: Paragraph,
  code: Code,
  heading_1: Heading,
  heading_2: Heading,
  heading_3: Heading,
  divider: Divider,
  quote: Quote,
  image: Image,
  bulleted_list_item: List,
};

interface BlockRenderProps {
  block: BlockObjectResponse;
}

const BlockRender: React.FC<BlockRenderProps> = (props) => {
  const { block } = props;
  const { type } = block;

  const Comp = NotionComponents[type];

  return (
    <>
      {Comp ? <Comp block={block} /> : null}
      {type === 'bulleted_list_item' && block.has_children && <Render id={block.id} layout="indented" />}
      {type === 'column_list' && block.has_children && <Render id={block.id} layout="grid" />}
    </>
  );
};

interface NotionRenderProps {
  /**
   * block id
   */
  id: string;

  /**
   * 游标
   */
  cursor?: string;

  /**
   * 布局方式
   */
  layout?: 'normal' | 'indented' | 'grid';

  style?: HTMLAttributes<HTMLDivElement>['style'];
}

const Render: React.FC<NotionRenderProps> = async ({ id, cursor, layout = 'normal', ...props }) => {
  const { results, has_more, next_cursor } = await client.blocks.children.list({
    block_id: id,
    start_cursor: cursor,
  });

  const styles: HTMLAttributes<HTMLDivElement>['style'] =
    layout === 'grid'
      ? {
          flexBasis: `${100 / results.length}%`,
          maxWidth: `${100 / results.length}%`,
        }
      : undefined;

  return (
    <>
      <div className={cls('jmd-notion-render', layout)} {...props}>
        {results.map((block) => {
          return layout === 'grid' ? (
            <Render id={block.id} style={styles} />
          ) : (
            <BlockRender block={block as BlockObjectResponse} />
          );
        })}
      </div>
      {has_more && next_cursor && <Render id={id} cursor={next_cursor} />}
    </>
  );
};

export { Render };
