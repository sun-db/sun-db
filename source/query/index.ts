import { JSONObject } from "read-json-safe";
import { Schema } from "../index.js";
import { ArrayTableData, ArrayTableItem, ArrayTableName } from "../table/array-table.js";
import { Where, compare } from "./where.js";

export type QueryOne<S extends Schema, N extends ArrayTableName<S>> = {
  where?: Where<S, N>;
};

export type Query<S extends Schema, N extends ArrayTableName<S>> = {
  where?: Where<S, N>;
  limit?: number;
  offset?: number;
};

export type DataQueryOne<S extends Schema, N extends ArrayTableName<S>> = QueryOne<S, N> & {
  data: ArrayTableItem<S, N>;
};

export type DataQuery<S extends Schema, N extends ArrayTableName<S>> = Query<S, N> & {
  data: ArrayTableItem<S, N>;
};

export type PartialDataQueryOne<S extends Schema, N extends ArrayTableName<S>> = QueryOne<S, N> & {
  data: ArrayTableItem<S, N> extends JSONObject ? Partial<ArrayTableItem<S, N>> : ArrayTableItem<S, N>;
};

export type PartialDataQuery<S extends Schema, N extends ArrayTableName<S>> = Query<S, N> & {
  data: ArrayTableItem<S, N> extends JSONObject ? Partial<ArrayTableItem<S, N>> : ArrayTableItem<S, N>;
};

export function find<S extends Schema, N extends ArrayTableName<S>>(array: ArrayTableData<S, N>, query?: QueryOne<S, N>) {
  return array.find((item) => {
    return compare(item, query?.where);
  });
}

export function filter<S extends Schema, N extends ArrayTableName<S>>(array: ArrayTableData<S, N>, query?: Query<S, N>) {
  if(query === undefined) {
    return array;
  } else {
    const result: ArrayTableData<S, N> = [];
    let index = 0;
    let offset = query.offset ?? 0;
    while(result.length < (query.limit ?? array.length) && index < array.length) {
      const item = array[index];
      if(compare(item, query.where)) {
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
  let offset = query.offset ?? 0;
  let limit = query.limit ?? array.length;
  const result: ArrayTableData<S, N> = [];
  for(const item of array) {
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


