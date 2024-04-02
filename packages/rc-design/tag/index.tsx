import React from 'react';

import './index.scss';

const Tag: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className="jcd-tag">{children}</div>;
};

export { Tag };
