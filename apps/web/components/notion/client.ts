import { Client } from '@notionhq/client';

import { apiCache } from './cache';
import { IS_DEV } from '../../utils/env';

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const client = new Client({ auth: process.env.NOTION_TOKEN });

/** 查询 page 列表 */
const fetchPageList = async (): Promise<PageObjectResponse[]> => {
  if (!process.env.NOTION_DATABASE_ID) {
    return [];
  }
  const CACHE_KEY = 'fetchPageList';
  if (IS_DEV && apiCache.has(CACHE_KEY)) {
    return apiCache.get(CACHE_KEY) as PageObjectResponse[];
  }
  const list = await client.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      property: 'Published',
      type: 'checkbox',
      checkbox: {
        equals: true,
      },
    },
    sorts: [{ property: 'Published Date', direction: 'descending' }],
  });
  const { results } = list;
  if (IS_DEV) {
    apiCache.set(CACHE_KEY, results);
  }
  return results as PageObjectResponse[];
};

const clientAPI = {
  fetchPageList,
};

export { client, clientAPI };
