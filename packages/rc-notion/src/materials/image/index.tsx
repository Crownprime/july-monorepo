import React from 'react';

import cls from 'classnames';

import type { NotionBlock } from '../../types';

import './index.scss';

type ImageProps = {
  block: NotionBlock.Image;
} & React.HTMLAttributes<HTMLImageElement>;

const Image: React.FC<ImageProps> = ({ block, className, ...props }) => {
  const { image } = block;
  const { type } = image;
  if (type === 'external') {
    return null;
  }

  return <img src={image.file.url} className={cls('jmd-notion-image', className)} {...props} />;
};

export { Image, type ImageProps };
