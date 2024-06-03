import type {
  BlockObjectResponse,
  RichTextItemResponse,
  ParagraphBlockObjectResponse,
  CodeBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  DividerBlockObjectResponse,
  ImageBlockObjectResponse,
  QuoteBlockObjectResponse,
  BulletedListItemBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export type RichText = RichTextItemResponse;

export type Paragraph = ParagraphBlockObjectResponse;

export type Code = CodeBlockObjectResponse;

export type Heading = Heading1BlockObjectResponse | Heading2BlockObjectResponse | Heading3BlockObjectResponse;

export type Divider = DividerBlockObjectResponse;

export type Image = ImageBlockObjectResponse;

export type Quote = QuoteBlockObjectResponse;

export type List = BulletedListItemBlockObjectResponse;

export type Block = RichText | Paragraph | Code | Heading | Divider | Image | List;

export type { BlockObjectResponse };
