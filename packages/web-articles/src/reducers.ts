import { get, filter, reject } from 'lodash-es';

import type { Article, ArticleMeta } from './typings';

export type Reducer = (articles: Article[]) => Article[];
export type GenerateReducer<T> = (options?: T) => Reducer;

/************************************************************
 * 排序函数
 */
/**
 * 根据时间排序
 */
type dateSorterOptions = {
  order?: 'asc' | 'desc';
};
export const dateSorter: GenerateReducer<dateSorterOptions> =
  ({ order } = {}) =>
  (articles) => {
    const temp = [...articles].sort((a, b) => b.meta.date - a.meta.date);
    return order === 'asc' ? [...temp].reverse() : temp;
  };

/*****************************************************
 * 过滤函数
 */
/**
 * 抽象的过滤符合 meta 条件的函数
 */
type metaFilterOptions = {
  key: 'id' | keyof ArticleMeta;
  values: any | any[];
  reject?: boolean;
};
export const metaFilter: GenerateReducer<metaFilterOptions> = (options) => {
  const { key, values } = options;
  const path = key === 'id' ? 'id' : ['meta', key];
  const fn = options.reject ? reject : filter;
  return (articles) =>
    fn(articles, (i) => {
      const v = get(i, path);
      return Array.isArray(values) ? values.includes(v) : values === v;
    });
};
/**
 * 过滤指定状态的函数
 */
type statusFilterOptions = {
  status?: 'draft' | 'published';
  reject?: boolean;
};
export const statusFilter: GenerateReducer<statusFilterOptions> = (options = {}) => {
  const { status = 'published', reject } = options;
  return metaFilter({ key: 'status', values: status, reject });
};

type idFilterOptions = {
  id: string;
};
export const idFilter: GenerateReducer<idFilterOptions> = (options) => {
  const { id } = options;
  return metaFilter({ key: 'id', values: id });
};
