import { Schema } from "../index.js";
import { ArrayTableData, ArrayTableItem, ArrayTableItemInput, ArrayTableName } from "../table/array-table.js";
import { Where, compare } from "./where.js";
import { OrderByQuery, sort } from "./order-by.js";

export type QueryOne<S extends Schema, N extends ArrayTableName<S>> = {
  where?: Where<S, N>;
} & OrderByQuery<S, N>;

export type Query<S extends Schema, N extends ArrayTableName<S>> = {
  where?: Where<S, N>;
  limit?: number;
  offset?: number;
} & OrderByQuery<S, N>;

export type DataQueryOne<S extends Schema, N extends ArrayTableName<S>> = QueryOne<S, N> & {
  data: ArrayTableItemInput<S, N>;
};

export type DataQuery<S extends Schema, N extends ArrayTableName<S>> = Query<S, N> & {
  data: ArrayTableItemInput<S, N>;
};

export type PartialDataQueryOne<S extends Schema, N extends ArrayTableName<S>> = QueryOne<S, N> & {
  data: Partial<ArrayTableItemInput<S, N>>;
};

export type PartialDataQuery<S extends Schema, N extends ArrayTableName<S>> = Query<S, N> & {
  data: Partial<ArrayTableItemInput<S, N>>;
};

export function find<S extends Schema, N extends ArrayTableName<S>>(array: ArrayTableData<S, N>, query?: QueryOne<S, N>) {
  const sortedArray = sort(array, query);
  return sortedArray.find((item) => {
    return compare(item, query?.where);
  });
}

export function filter<S extends Schema, N extends ArrayTableName<S>>(array: ArrayTableData<S, N>, query?: Query<S, N>) {
  const sortedArray = sort(array, query);
  if(query === undefined) {
    return sortedArray;
  } else if(query.limit === undefined && query.offset === undefined) {
    return sortedArray.filter((item) => {
      return compare(item, query.where);
    });
  } else {
    const result: ArrayTableData<S, N> = [];
    let index = 0;
    let offset = query.offset ?? 0;
    while(result.length < (query.limit ?? array.length) && index < array.length) {
      const item = array[index];
      if(item !== undefined && compare(item, query.where)) {
        if(offset > 0) {
          offset -= 1;
        } else {
          result.push(item);
        }
      }
      index+=1;
    }
    return result;
  }
}

export function map<S extends Schema, N extends ArrayTableName<S>>(
  array: ArrayTableData<S, N>,
  query: Query<S, N> = {},
  fn: (item: ArrayTableItem<S, N>) => ArrayTableItem<S, N> | undefined
) {
  const sortedArray = sort(array, query);
  let offset = query.offset ?? 0;
  let limit = query.limit ?? sortedArray.length;
  const result: ArrayTableData<S, N> = [];
  for(const item of sortedArray) {
    if(compare(item, query.where)) {
      if(offset > 0) {
        offset -= 1;
        result.push(item);
      } else if(limit > 0) {
        limit -= 1;
        const replace = fn(item);
        if(replace !== undefined) {
          result.push(replace);
        }
      } else {
        result.push(item);
      }
    } else {
      result.push(item);
    }
  }
  return result;
}


