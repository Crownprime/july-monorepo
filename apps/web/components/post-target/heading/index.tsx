import React from 'react';

import cls from 'classnames';

import styles from './heading.module.scss';

type HeadingProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;

enum HeadingType {
  H1,
  H2,
  H3,
}

const Heading: React.FC<
  HeadingProps & {
    type: HeadingType;
  }
> = ({ className, type, ...props }) => {
  return (
    <h1
      className={cls(
        {
          [styles['heading1']]: type === HeadingType.H1,
          [styles['heading2']]: type === HeadingType.H2,
          [styles['heading3']]: type === HeadingType.H3,
        },
        className
      )}
      {...props}
    />
  );
};

const Heading1: React.FC<HeadingProps> = (props) => <Heading {...props} type={HeadingType.H1} />;
const Heading2: React.FC<HeadingProps> = (props) => <Heading {...props} type={HeadingType.H2} />;
const Heading3: React.FC<HeadingProps> = (props) => <Heading {...props} type={HeadingType.H3} />;

export { Heading1, Heading2, Heading3 };
