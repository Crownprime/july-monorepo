import React from 'react';

import { NotionBlockRender } from '@july_cm/rc-notion';

import { fetchPageBlocks } from '../../utils/notion-client';

type BlocksServerProps = {
  id: string;
};

const BlocksServer: React.FC<BlocksServerProps> = async ({ id }) => {
  const blocks = await fetchPageBlocks(id);
  return blocks.map((block) => <NotionBlockRender block={block} />);
};

export { BlocksServer };
