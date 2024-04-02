import type {
  RichTextItemResponse,
  ParagraphBlockObjectResponse,
  CodeBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export type RichText = RichTextItemResponse;

export type Paragraph = ParagraphBlockObjectResponse;

export type Code = CodeBlockObjectResponse;

export type Heading = Heading1BlockObjectResponse | Heading2BlockObjectResponse | Heading3BlockObjectResponse;

export type Block = RichText | Paragraph | Code | Heading;
