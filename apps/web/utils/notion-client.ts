import { Client } from '@notionhq/client';

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const client = new Client({ auth: process.env.NOTION_TOKEN });

/** 查询 page 列表 */
const fetchPageList = async () => {
  if (!process.env.NOTION_DATABASE_ID) {
    return [];
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
  // const list = await client.search({
  //   filter: {
  //     property: 'object',
  //     value: 'page',
  //   },
  // });
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

/** 查询 block */
const fetchBlock = async (id: string) => {
  const block = await client.blocks.retrieve({ block_id: id });
  console.log(block);
  return block;
};

export { fetchPageList, fetchPage, fetchPageBlocks, fetchBlock, client };
