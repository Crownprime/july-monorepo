'use client';
import { forwardRef, useMemo } from 'react';

import cls from 'classnames';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

import styles from './styles.module.scss';

/**
 * 复写 Next Link
 * 1. 检验目标路径和当前路径一致性
 * 2. 增加一些自定义样式
 */
const Link: typeof NextLink = forwardRef((props, ref) => {
  const { href, className } = props;
  const pathname = usePathname();

  const active = useMemo(() => href === pathname, [href, pathname]);

  return (
    <NextLink
      className={cls(styles['link'], className, { [styles['active']]: active })}
      ref={ref}
      {...props}
    />
  );
});

export { Link };
