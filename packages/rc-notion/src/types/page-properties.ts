import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

interface PropertyBase {
  id: string;
  type: string;
}

export interface Title extends PropertyBase {
  type: 'title';
  title: Array<RichTextItemResponse>;
}
export interface Description extends PropertyBase {
  type: 'rich_text';
  rich_text: Array<RichTextItemResponse>;
}
export interface Date extends PropertyBase {
  type: 'date';
  date: {
    start: string;
    end: string | null;
    time_zone: null;
  };
}
export interface MultiSelect extends PropertyBase {
  type: 'multi_select';
  multi_select: {
    id: string;
    name: string;
  }[];
}
