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

  return (
    <div className={cls('jmd-notion-image', className)}>
      <img src={image.file.url} {...props} />
    </div>
  );
};

export { Image, type ImageProps };
