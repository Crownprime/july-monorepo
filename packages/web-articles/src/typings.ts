export interface ArticleMeta {
  title: string;
  date: number;
  status?: 'draft' | 'published';
}

export interface Article {
  id: string;
  meta: ArticleMeta;
  content: string;
}
