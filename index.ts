import {
  BLOCKS,
  INLINES,
  TopLevelBlock,
  type Block,
  type Inline,
  type Document,
  type Text,
} from '@contentful/rich-text-types'

/**
 * cleanup the RichText document based on the maxLevel.
 * @param node
 * @param maxLevel
 * @returns
 */
export const cleanupRichTextDocument = (node: Document, maxLevel: number): any => {
  const content = node.content
  content?.map((info: TopLevelBlock) => checkLevel(info, 0, maxLevel))

  return node
}

/**
 * Cleanup the node based on the node type.
 * @param node
 * @returns
 */

const cleanupLevel = (node: Block | Inline | Text): Block | Inline | Text => {
  switch (node.nodeType) {
    case BLOCKS.EMBEDDED_ENTRY:
    case INLINES.EMBEDDED_ENTRY:
    case INLINES.ENTRY_HYPERLINK:
      node.data = { target: { ...node.data.target, fields: {} } }
      break

    case BLOCKS.PARAGRAPH:
      node.content = []
      break
  }
  return node
}

/**
 * Traverse the contentful document and check the level of the node.
 * If the level is greater than the maxLevel, cleanup the node.
 * Otherwise, traverse the node.
 * @param node
 * @param level
 * @param maxLevel
 * @returns
 */

const checkLevel = (
  node: Block | Inline | Text,
  level: number,
  maxLevel: number
): Block | Inline | Text => {
  const nextLevel = ++level
  if (level > maxLevel) return cleanupLevel(node)

  switch (node.nodeType) {
    case BLOCKS.DOCUMENT:
    case BLOCKS.PARAGRAPH: {
      node.content.map((info: Block | Inline | Text) => checkLevel(info, nextLevel, maxLevel))
      return node
    }
    case BLOCKS.EMBEDDED_ENTRY:
    case INLINES.EMBEDDED_ENTRY: {
      return checkLevel(node.data.target, nextLevel, maxLevel)
    }
    case INLINES.ENTRY_HYPERLINK: {
      return checkLevel(node.data.target.fields.body, nextLevel, maxLevel)
    }
    default:
      return node
  }
}
