import { type NotionPageProperty } from '@july_cm/rc-notion';

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const getPageProperties = (page: PageObjectResponse) => {
  const { properties } = page;

  const title = properties.Name as NotionPageProperty.Title;
  const description = properties.Description as NotionPageProperty.Description;
  const tags = properties.Tags as NotionPageProperty.MultiSelect;
  const date = properties['Published Date'] as NotionPageProperty.Date;
  return {
    title,
    description,
    tags,
    date,
  };
};

export { getPageProperties };
