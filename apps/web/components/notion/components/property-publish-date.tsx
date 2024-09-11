import React from 'react';

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type PublishDateProperty = {
  type: 'date';
  date: {
    start: string;
    end: string | null;
    time_zone: null;
  };
};

type DateProps = {
  page: PageObjectResponse;
} & Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

const PropertyPublishDate: React.FC<DateProps> = ({ page, ...props }) => {
  const date = (page.properties['Published Date'] as PublishDateProperty).date;
  return <div {...props}>{date.start}</div>;
};

export { PropertyPublishDate };
