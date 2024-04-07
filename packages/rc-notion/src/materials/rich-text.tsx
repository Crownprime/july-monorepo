import React from 'react';

import { Typography } from '@july_cm/rc-design';

import { NotionBlock } from '../types';

type RichTextProps = {
  block: NotionBlock.RichText;
} & React.HTMLAttributes<HTMLSpanElement>;

const RichText: React.FC<RichTextProps> = ({ block, ...props }) => {
  const { type, plain_text: text, annotations, href } = block;
  if (type === 'mention' || type === 'equation') {
    return null;
  }
  return (
    <Typography.Text href={href} {...annotations} {...props}>
      {text}
    </Typography.Text>
  );
};

export { RichText, type RichTextProps };
