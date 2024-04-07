import React, { useMemo } from 'react';

import cls from 'classnames';

type TextProps = {
  bold?: boolean;
  code?: boolean;
} & (React.HTMLAttributes<HTMLSpanElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>);

const Text: React.FC<React.PropsWithChildren<TextProps>> = ({ bold, code, className, ...props }) => {
  const { href } = props;
  const Component = useMemo(() => (href ? 'a' : 'span'), [href]);

  return (
    <Component
      className={cls(
        'jmd-text',
        {
          bold,
          code,
          href: !!href,
        },
        className
      )}
      {...props}
    />
  );
};

export { Text, type TextProps };
