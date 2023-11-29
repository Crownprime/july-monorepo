import { dateSorter, metaFilter, idFilter, statusFilter, type Reducer } from './reducers';

import type { Article } from './typings';

class Articles {
  protected articles: Article[] = [];
  public static reducers = {
    dateSorter,
    metaFilter,
    idFilter,
    statusFilter,
  };
  constructor(data: Article[]) {
    this.articles = data;
  }

  /**
   * 获取整个列表
   */
  get value() {
    return this.articles;
  }
  /**
   * 获取第一项
   */
  get one() {
    return this.articles[0];
  }

  private reducer(reducers: Reducer[]) {
    return new Articles(reducers.reduce((prev, reducer) => reducer(prev), this.articles));
  }

  /***********************************************************
   * 链式调用工具属性
   */
  sortByDate() {
    return this.reducer([Articles.reducers.dateSorter()]);
  }

  filterByPublished() {
    return this.reducer([Articles.reducers.statusFilter({ status: 'draft', reject: true })]);
  }
  filterById(id: string) {
    return this.reducer([Articles.reducers.idFilter({ id: id })]);
  }
}

export { Articles };
