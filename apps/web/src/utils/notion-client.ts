import { Client } from '@notionhq/client';

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const client = new Client({ auth: process.env.NOTION_TOKEN });

/** 查询 page 列表 */
const fetchPageList = async () => {
  const list = await client.search({
    filter: {
      property: 'object',
      value: 'page',
    },
  });
  return list.results as PageObjectResponse[];
};

/** 查询 page 详情，不包括 blocks */
const fetchPage = async (id: string) => {
  const page = await client.pages.retrieve({ page_id: id });
  return page as PageObjectResponse;
};

/** 查询 page 的 blocks */
const fetchPageBlocks = async (id: string) => {
  /** page 本身是一种 block，所以 page 的内容即为其 children */
  const blocks = await client.blocks.children.list({ block_id: id });
  return blocks.results;
};

export { fetchPageList, fetchPage, fetchPageBlocks, client };
