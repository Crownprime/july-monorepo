import rehypePrism from '@mapbox/rehype-prism';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified, PluggableList, type Processor } from 'unified';
import { VFile } from 'vfile';

type SerializeOptions = {
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
};

const compileMd2Ast = (pipeline: Processor, options?: SerializeOptions) => {
  return pipeline.use(remarkParse);
};

const serialize = (source: string, options?: SerializeOptions): string => {
  const vFile = new VFile(source);

  const pipeline = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .use(rehypeStringify)
    .use(rehypeStringify);

  if (options?.remarkPlugins) {
    pipeline.use(options.remarkPlugins);
  }

  pipeline.use(remarkRehype).use(rehypePrism);

  if (options.rehypePlugins) {
    pipeline.use(options.rehypePlugins);
  }

  return pipeline.processSync(vFile).toString();
};

export { serialize, compileMd2Ast };
