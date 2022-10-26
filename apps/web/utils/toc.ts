import { last, cloneDeep } from 'lodash-es'
import { Content, Heading, Text, Paragraph } from 'mdast'

const isText = (c: Content): c is Text => c.type === 'text'
const isHeading = (c: Content): c is Heading => c.type === 'heading'
const isParagraph = (c: Content): c is Paragraph => c.type === 'paragraph'

/**************************************************************************
 * 根据摊平的目录节点构建 toc 树
 */
export const crateTOCTree = (list: Content[], dep?: number) => {
  let _list = cloneDeep(list.filter(isHeading))
  if (dep) {
    _list = _list.filter(i => i.depth <= dep)
  }
  const toc: TOCNode[] = []
  const stack = []
  _list.forEach(heading => {
    const { depth, children } = heading
    const text = children.filter(isText)[0].value
    const node: TOCNode = {
      depth,
      text,
      children: [],
    }
    while (true) {
      // 栈为空，说明是顶级节点，入栈&入队列
      if (!stack.length) {
        stack.push(node)
        toc.push(node)
        break
      } else {
        const p = last(stack)
        // 如果栈顶元素层级大于目前节点层级，可以认为目前节点是栈顶节点的子元素，入栈&入栈顶元素子节点队列
        if (p.depth < node.depth) {
          p.children.push(node)
          stack.push(node)
          break
        } else {
          // 如果两者平级或者目前节点更高层，则栈顶元素出栈，继续循环比较
          stack.pop()
          continue
        }
      }
    }
  })
  return toc
}

/**
 *****************************************
 * 获得首段内容
 */
export const getFirstParagraph = (list: Content[]) => {
  const _list = cloneDeep(list.filter(isParagraph))
  if (!_list.length) {
    return null
  }
  return _list[0].children?.filter(isText)?.[0].value
}
