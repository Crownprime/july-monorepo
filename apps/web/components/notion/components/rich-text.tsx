import React from 'react';

import { Typography } from '@july_cm/rc-design';

import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

type RichTextProps = {
  block: RichTextItemResponse;
} & React.HTMLAttributes<HTMLSpanElement>;

const RichText: React.FC<RichTextProps> = ({ block, ...props }) => {
  const { type, plain_text: text, annotations, href } = block;
  if (type === 'mention' || type === 'equation') {
    return null;
  }
  return (
    <Typography.Text href={href || undefined} {...annotations} {...props}>
      {text}
    </Typography.Text>
  );
};

export { RichText, type RichTextProps };
