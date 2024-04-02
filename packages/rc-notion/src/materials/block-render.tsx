import React from 'react';

import { Code, type CodeProps } from './code';
import { Heading, type HeadingProps } from './heading';
import { Paragraph, type ParagraphProps } from './paragraph';
import { RichText, type RichTextProps } from './rich-text';

type BlockRenderProps = RichTextProps | ParagraphProps | CodeProps | HeadingProps;

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
    default:
      return null;
  }
};

export { BlockRender };
