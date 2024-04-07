import React from 'react';

import { Typography } from '@july_cm/rc-design';

import { RichText } from './rich-text';

import type { NotionBlock } from '../types';

type ParagraphProps = {
  block: NotionBlock.Paragraph;
} & React.HTMLAttributes<HTMLParagraphElement>;

const Paragraph: React.FC<ParagraphProps> = ({ block, ...props }) => {
  const { paragraph } = block;
  const { rich_text: text } = paragraph;
  return (
    <Typography.Paragraph {...props}>
      {text.map((t) => (
        <RichText block={t} key={t.plain_text} />
      ))}
    </Typography.Paragraph>
  );
};

export { Paragraph, type ParagraphProps };
