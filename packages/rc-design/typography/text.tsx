import React, { useMemo } from 'react';

import cls from 'classnames';

type TextProps = {
  bold?: boolean;
  code?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
} & (React.HTMLAttributes<HTMLSpanElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>);

const Text: React.FC<React.PropsWithChildren<TextProps>> = ({
  bold,
  code,
  italic,
  strikethrough,
  underline,
  className,
  ...props
}) => {
  const { href } = props;
  const Component = useMemo(() => (href ? 'a' : 'span'), [href]);

  return (
    <Component
      className={cls(
        'jmd-text',
        {
          bold,
          code,
          italic,
          strikethrough,
          underline,
          href: !!href,
        },
        className
      )}
      {...props}
    />
  );
};

export { Text, type TextProps };
