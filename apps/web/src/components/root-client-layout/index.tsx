'use client';
/**
 * 根级 Layout
 * 由于使用了 usePathname 判断是否是首页，所以只能是客户端组件。
 * 关于这一点也考虑过是否将 layout 拆分为两个组件，一个特殊给到首页，一个给到其他页面。
 * 仔细研究之后发现似乎不会影响子组件的服务器属性，只不过在该组件内的所有逻辑是发下到客户端运行
 * https://zh-hans.react.dev/reference/react/use-client#how-use-client-marks-client-code
 */
import React from 'react';

import { usePathname } from 'next/navigation';

import { ContentUILayout } from './content-ui-layout';
import { StyledComponentRegistry } from './styled-components-registry';

export const RootClientLayout: React.FC<React.PropsWithChildren> = (props) => {
  const pathname = usePathname();
  /**
   * 首页比较特殊是全屏的
   */
  if (pathname === '/') {
    return <StyledComponentRegistry {...props} />;
  }
  /**
   * 其他页面都会有一些基本要素，所以套一个壳子
   */
  return (
    <StyledComponentRegistry>
      <ContentUILayout {...props} />
    </StyledComponentRegistry>
  );
};
