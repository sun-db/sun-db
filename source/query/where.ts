import { JSONValue, JSONArray, JSONObject } from "read-json-safe";
import { Schema } from "../index.js";
import { ArrayTableItem, ArrayTableName } from "../table/array-table.js";

export type JSONPrimitive = boolean | string | number | null;

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
  startsWith?: string;
  nstartsWith?: string;
  endsWith?: string;
  nendsWith?: string;
  includes?: string;
  nincludes?: string;
  regex?: RegExp;
  nregex?: RegExp;
};

export type NullComparison<V extends null> =
  & EqualityComparison<V>
  & ListComparison<V>;

export type BooleanComparison<V extends boolean> =
  & EqualityComparison<V>
  & ListComparison<V>;

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
          : V extends null
            ? NullComparison<V>
            : never;

export type Where<S extends Schema, N extends ArrayTableName<S>> = Comparison<ArrayTableItem<S, N>>;

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
  if(where.startsWith !== undefined) {
    result = result && value.startsWith(where.startsWith);
  }
  if(where.nstartsWith !== undefined) {
    result = result && !value.startsWith(where.nstartsWith);
  }
  if(where.endsWith !== undefined) {
    result = result && value.endsWith(where.endsWith);
  }
  if(where.nendsWith !== undefined) {
    result = result && !value.endsWith(where.nendsWith);
  }
  if(where.includes !== undefined) {
    result = result && value.includes(where.includes);
  }
  if(where.nincludes !== undefined) {
    result = result && !value.includes(where.nincludes);
  }
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

export function compare<V extends JSONValue>(value: V, where?: Comparison<V>): boolean {
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
