import React from 'react';

import cls from 'classnames';

type BaseSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

const BaseSkeleton: React.FC<BaseSkeletonProps> = ({ className, ...props }) => {
  return <div className={cls('jcd-skeleton', className)} {...props} />;
};

export { BaseSkeleton };
