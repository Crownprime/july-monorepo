import React from 'react';

import cls from 'classnames';

import styles from './paragraph.module.scss';

const Paragraph: React.FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
> = ({ className, ...props }) => {
  return <p className={cls(styles['paragraph'], className)} {...props} />;
};

export { Paragraph };
