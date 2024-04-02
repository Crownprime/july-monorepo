import React from 'react';

import cls from 'classnames';

import { RichText } from '../rich-text';

import type { NotionBlock } from '../../types';

import './index.scss';

type ParagraphProps = {
  block: NotionBlock.Paragraph;
} & React.HTMLAttributes<HTMLParagraphElement>;

const Paragraph: React.FC<ParagraphProps> = ({ block, className, ...props }) => {
  const { paragraph } = block;
  const { rich_text: text } = paragraph;
  return (
    <p className={cls('jmd-notion-paragraph', className)} {...props}>
      {text.map((t) => (
        <RichText block={t} key={t.plain_text} />
      ))}
    </p>
  );
};

export { Paragraph, type ParagraphProps };
