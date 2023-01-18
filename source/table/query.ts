/* eslint-disable max-lines */
/* eslint-disable max-len */
import { JSONValue, JSONArray, JSONObject } from "read-json-safe";
import { Schema } from "../index.js";
import { ArrayTableData, ArrayTableItem, ArrayTableName } from "./array-table.js";

type JSONPrimitive = boolean | string | number | null;

export type EqualityComparison<V extends JSONPrimitive> = {
  eq?: V;
  neq?: V;
};

export type MagnitudeComparison<V extends string | number> = {
  gt?: V;
  gte?: V;
  lt?: V;
  lte?: V;
};

export type ListComparison<V extends JSONPrimitive> = {
  in?: V[];
  nin?: V[];
};

export type TextComparison = {
  regex?: RegExp;
  nregex?: RegExp;
};

export type BooleanComparison<V extends boolean> = EqualityComparison<V>;

export type NumberComparison<V extends number> =
  & EqualityComparison<V>
  & MagnitudeComparison<V>
  & ListComparison<V>;

export type StringComparison<V extends string> =
  & EqualityComparison<V>
  & MagnitudeComparison<V>
  & ListComparison<V>
  & TextComparison;

export type ArrayComparison<V extends JSONArray> = {
  contains?: Comparison<V[number]>;
  ncontains?: Comparison<V[number]>;
};

export type ObjectComparison<V extends JSONObject> = {
  [K in keyof V]?: V[K] extends JSONValue ? Comparison<V[K]> : never;
};

export type Comparison<V extends JSONValue> = V extends boolean
  ? BooleanComparison<V>
  : V extends number
    ? NumberComparison<V>
    : V extends string
      ? StringComparison<V>
      : V extends JSONArray
        ? ArrayComparison<V>
        : V extends JSONObject
          ? ObjectComparison<V>
          : never;

export type Where<S extends Schema, N extends ArrayTableName<S>> = Comparison<ArrayTableItem<S, N>>;

export type QueryOne<S extends Schema, N extends ArrayTableName<S>> = {
  where: Where<S, N>;
};

export type Query<S extends Schema, N extends ArrayTableName<S>> = {
  where?: Where<S, N>;
  limit?: number;
  offset?: number;
};

function compareEquality<V extends JSONPrimitive>(value: V, where: EqualityComparison<V>): boolean {
  let result = true;
  if(where.eq !== undefined) {
    result = result && (value === where.eq);
  }
  if(where.neq !== undefined) {
    result = result && (value !== where.neq);
  }
  return result;
}

function compareMagnitude<V extends string | number>(value: V, where: MagnitudeComparison<V>): boolean {
  let result = true;
  if(where.gt !== undefined && where.gt !== null && value !== null) {
    result = result && (value > where.gt);
  }
  if(where.gte !== undefined) {
    result = result && (value >= where.gte);
  }
  if(where.lt !== undefined) {
    result = result && (value < where.lt);
  }
  if(where.lte !== undefined) {
    result = result && (value <= where.lte);
  }
  return result;
}

function compareList<V extends JSONPrimitive>(value: V, where: ListComparison<V>): boolean {
  let result = true;
  if(where.in !== undefined) {
    result = result && where.in.includes(value);
  }
  if(where.nin !== undefined) {
    result = result && !where.nin.includes(value);
  }
  return result;
}

function compareText(value: string, where: TextComparison): boolean {
  let result = true;
  if(where.regex !== undefined) {
    result = result && where.regex.test(value);
  }
  if(where.nregex !== undefined) {
    result = result && !where.nregex.test(value);
  }
  return result;
}

function compareArray<V extends JSONArray>(value: V, where: ArrayComparison<V>): boolean {
  let result = true;
  const contains = where.contains;
  if(contains !== undefined) {
    result = result && value.some((item) => compare(item, contains));
  }
  const ncontains = where.ncontains;
  if(ncontains !== undefined) {
    result = result && !value.some((item) => compare(item, ncontains));
  }
  return result;
}

function compareObject<V extends JSONObject>(value: V, where: ObjectComparison<V>): boolean {
  let result = true;
  // eslint-disable-next-line guard-for-in
  for(const fieldName in where) {
    const fieldValue = value[fieldName];
    const comparison = where[fieldName];
    if(fieldValue) {
      result = result && compare(fieldValue, comparison as Comparison<NonNullable<V[Extract<keyof V, string>]>>);
    }
  }
  return result;
}

function compare<V extends JSONValue>(value: V, where?: Comparison<V>): boolean {
  let result = true;
  if(where === undefined) {
    return result;
  } else if(value === null) {
    result = result && compareEquality(value, where as EqualityComparison<null>);
  } else if(typeof value === "boolean") {
    result = result && compareEquality(value, where as BooleanComparison<boolean>);
  } else if(typeof value === "number") {
    result = result && compareEquality(value, where as EqualityComparison<number>);
    result = result && compareMagnitude(value, where as MagnitudeComparison<number>);
    result = result && compareList(value, where as ListComparison<number>);
  } else if(typeof value === "string") {
    result = result && compareEquality(value, where as EqualityComparison<string>);
    result = result && compareMagnitude(value, where as MagnitudeComparison<string>);
    result = result && compareList(value, where as ListComparison<string>);
    result = result && compareText(value, where as TextComparison);
  } else if(Array.isArray(value)) {
    result = result && compareArray(value, where as ArrayComparison<JSONArray>);
  } else {
    result = result && compareObject(value, where as ObjectComparison<JSONObject>);
  }
  return result;
}

export function find<S extends Schema, N extends ArrayTableName<S>>(array: ArrayTableData<S, N>, query: QueryOne<S, N>) {
  return array.find((item) => {
    return compare(item, query.where);
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
  query: Query<S, N>,
  fn: (item: ArrayTableItem<S, N>) => ArrayTableItem<S, N> | undefined
) {
  const result: ArrayTableData<S, N> = [];
  let index = 0;
  let offset = query.offset ?? 0;
  while(result.length < (query.limit ?? array.length) && index < array.length) {
    const item = array[index];
    if(compare(item, query.where)) {
      if(offset > 0) {
        offset -= 1;
        result.push(item);
      } else {
        const mapped = fn(item);
        if(mapped !== undefined) {
          result.push(mapped);
        }
      }
    } else {
      result.push(item);
    }
    index+=1;
  }
  return result;
}


