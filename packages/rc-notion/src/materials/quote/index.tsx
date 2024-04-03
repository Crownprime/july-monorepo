import React from 'react';

import cls from 'classnames';

import { RichText } from '../rich-text';

import type { NotionBlock } from '../../types';

import './index.scss';

type QuoteProps = {
  block: NotionBlock.Quote;
} & React.HTMLAttributes<HTMLQuoteElement>;

const Quote: React.FC<QuoteProps> = ({ block, className, ...props }) => {
  const { quote } = block;
  const { rich_text: text } = quote;
  return (
    <blockquote className={cls('jmd-notion-quote', className)} {...props}>
      {text.map((t) => (
        <RichText block={t} key={t.plain_text} />
      ))}
    </blockquote>
  );
};

export { Quote, type QuoteProps };
