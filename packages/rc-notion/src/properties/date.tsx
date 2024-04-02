import React from 'react';

import { NotionPageProperty } from '../types';

type DateProps = {
  property: NotionPageProperty.Date;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const Date: React.FC<DateProps> = ({ property, ...props }) => {
  const { date } = property;
  return <div {...props}>{date.start}</div>;
};

export { Date };
