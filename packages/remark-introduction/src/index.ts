/**
 * RemarkPlugin
 * 提取并显示第一段作为摘要
 */
import type { Root } from 'mdast';

const remarkIntroduction = () => {
  /**
   * mdx tree 的类型遵循 mdast 规范
   * 看了好久源码才找到：https://github.com/mdx-js/mdx/blob/main/packages/mdx/lib/plugin/remark-mark-and-unravel.js
   * 顺便记录一点关于 mdx 解析调用关系的心得：
   * 从外向内剥开：
   * 1. next-mdx-remote => 最外层应用层，适配 nextjs 的 mdx 解析组件
   * 2. @mdx-js/mdx => mdx 解析器，主要把 mdx 解析的配置安顺序组装好，比如 remarkParse、remarkMdx 还有外界传入的 remarkPlugins、rehypePlugins 等在这聚合
   * 3. unified => 核心解析器
   */
  return (tree: Root) => {
    const children = tree.children || [];
    /**
     * 找到第一个段落，并作为唯一的 content
     * TODO: 这里有个问题是段落里可能存在各种行内元素，这些元素的去留是可以做一些配置的，但偷懒暂时没做
     */
    const first = children.find((i) => i.type === 'paragraph');
    if (!first) return;
    tree.children = [first];
  };
};

export { remarkIntroduction };
