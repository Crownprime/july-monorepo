import React from 'react';

import cls from 'classnames';

type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;

const Paragraph: React.FC<React.PropsWithChildren<ParagraphProps>> = ({ className, ...props }) => {
  return <p className={cls('jmd-paragraph', className)} {...props} />;
};

export { Paragraph, type ParagraphProps };
