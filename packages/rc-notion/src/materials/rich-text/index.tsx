import React from 'react';

import cls from 'classnames';

import { NotionBlock } from '../../types';

import './index.scss';

type RichTextProps = {
  block: NotionBlock.RichText;
} & React.HTMLAttributes<HTMLSpanElement>;

const RichText: React.FC<RichTextProps> = ({ block, className, ...props }) => {
  const { type, plain_text: text, annotations, href } = block;
  const { bold, code } = annotations;
  if (type === 'mention' || type === 'equation') {
    return null;
  }
  if (href) {
    return (
      <a className={cls('jmd-notion-rich-text', 'href', className)} href={href} target="_blank">
        {text}
      </a>
    );
  }
  return (
    <span
      className={cls(
        'jmd-notion-rich-text',
        {
          bold,
          code,
        },
        className
      )}
      {...props}
    >
      {text}
    </span>
  );
};

export { RichText, type RichTextProps };
