import React from 'react';

import { Code, type CodeProps } from './code';
import { Divider } from './divider';
import { Heading, type HeadingProps } from './heading';
import { Image, type ImageProps } from './image';
import { List, type ListProps } from './list';
import { Paragraph, type ParagraphProps } from './paragraph';
import { Quote, type QuoteProps } from './quote';
import { RichText, type RichTextProps } from './rich-text';

import type { NotionBlock } from '../types';

type BlockRenderProps =
  | RichTextProps
  | ParagraphProps
  | CodeProps
  | HeadingProps
  | QuoteProps
  | ImageProps
  | ListProps
  | {
      block: NotionBlock.Divider;
    };

const BlockRender: React.FC<BlockRenderProps> = (props) => {
  const { block } = props;
  const { type } = block;

  switch (type) {
    case 'text':
    case 'equation':
    case 'mention':
      return <RichText {...(props as RichTextProps)} />;
    case 'paragraph':
      return <Paragraph {...(props as ParagraphProps)} />;
    case 'code':
      return <Code {...(props as CodeProps)} />;
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
      return <Heading {...(props as HeadingProps)} />;
    case 'divider':
      return <Divider />;
    case 'quote':
      return <Quote {...(props as QuoteProps)} />;
    case 'image':
      return <Image {...(props as ImageProps)} />;
    case 'bulleted_list_item':
      return <List {...(props as ListProps)} />;
    default:
      return null;
  }
};

export { BlockRender };
