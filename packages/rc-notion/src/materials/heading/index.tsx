import React, { useMemo } from 'react';

import cls from 'classnames';

import { RichText } from '../rich-text';

import type { NotionBlock } from '../../types';

import './index.scss';

type InnerHeadingProps = {
  type: 'heading_1' | 'heading_2' | 'heading_3';
} & React.HTMLAttributes<HTMLHeadingElement>;

type HeadingProps = {
  block: NotionBlock.Heading;
} & React.HTMLAttributes<HTMLHeadingElement>;

const InnerHeading: React.FC<React.PropsWithChildren<InnerHeadingProps>> = ({ type, ...props }) => {
  switch (type) {
    case 'heading_1':
      return <h2 {...props} />;
    case 'heading_2':
      return <h3 {...props} />;
    default:
      return <h4 {...props} />;
  }
};

const Heading: React.FC<HeadingProps> = ({ block, className, ...props }) => {
  const { type } = block;
  const text = useMemo(() => {
    switch (type) {
      case 'heading_1':
        const { rich_text: richText1 } = block.heading_1;
        return richText1;
      case 'heading_2':
        const { rich_text: richText2 } = block.heading_2;
        return richText2;
      default:
        const { rich_text: richText3 } = block.heading_3;
        return richText3;
    }
  }, []);

  return (
    <InnerHeading type={type} className={cls('jmd-notion-heading', className)} {...props}>
      {text.map((i) => (
        <RichText block={i} key={i.plain_text} />
      ))}
    </InnerHeading>
  );
};

export { Heading, type HeadingProps };
