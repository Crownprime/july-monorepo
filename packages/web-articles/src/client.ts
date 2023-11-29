import { Articles } from './core';

import type { Article } from './typings';

const client = (articles: Article[]) => {
  return new Articles(articles);
};

export { client };
export default client;
