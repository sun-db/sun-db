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
  if(where.eq !== undefined && value !== where.eq) {
    return false;
  }
  if(where.neq !== undefined && value === where.neq) {
    return false;
  }
  return true;
}

function compareMagnitude<V extends string | number>(value: V, where: MagnitudeComparison<V>): boolean {
  if(where.gt !== undefined && value <= where.gt) {
    return false;
  }
  if(where.gte !== undefined && value < where.gte) {
    return false;
  }
  if(where.lt !== undefined && value >= where.lt) {
    return false;
  }
  if(where.lte !== undefined && value > where.lte) {
    return false;
  }
  return true;
}

function compareList<V extends JSONPrimitive>(value: V, where: ListComparison<V>): boolean {
  if(where.in !== undefined && !where.in.includes(value)) {
    return false;
  }
  if(where.nin !== undefined && where.nin.includes(value)) {
    return false;
  }
  return true;
}

function compareText(value: string, where: TextComparison): boolean {
  if(where.startsWith !== undefined && !value.startsWith(where.startsWith)) {
    return false;
  }
  if(where.nstartsWith !== undefined && value.startsWith(where.nstartsWith)) {
    return false;
  }
  if(where.endsWith !== undefined && !value.endsWith(where.endsWith)) {
    return false;
  }
  if(where.nendsWith !== undefined && value.endsWith(where.nendsWith)) {
    return false;
  }
  if(where.includes !== undefined && !value.includes(where.includes)) {
    return false;
  }
  if(where.nincludes !== undefined && value.includes(where.nincludes)) {
    return false;
  }
  if(where.regex !== undefined && !where.regex.test(value)) {
    return false;
  }
  if(where.nregex !== undefined && where.nregex.test(value)) {
    return false;
  }
  return true;
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
  // eslint-disable-next-line guard-for-in
  for(const fieldName in where) {
    const fieldValue = value[fieldName];
    if(fieldValue !== undefined) {
      const comparison = where[fieldName] as Comparison<NonNullable<V[Extract<keyof V, string>]>>;
      if(compare(fieldValue, comparison) === false) {
        return false;
      }
    }
  }
  return true;
}

export function compare<V extends JSONValue>(value: V, where?: Comparison<V>): boolean {
  if(where === undefined) {
    return true;
  } else if(typeof value === "boolean") {
    return compareEquality(value, where as BooleanComparison<boolean>);
  } else if(typeof value === "number") {
    return compareEquality(value, where as EqualityComparison<number>)
      && compareMagnitude(value, where as MagnitudeComparison<number>)
      && compareList(value, where as ListComparison<number>);
  } else if(typeof value === "string") {
    return compareEquality(value, where as EqualityComparison<string>)
      && compareMagnitude(value, where as MagnitudeComparison<string>)
      && compareList(value, where as ListComparison<string>)
      && compareText(value, where as TextComparison);
  } else if(value === null) {
    return compareEquality(value, where as EqualityComparison<null>);
  } else if(Array.isArray(value)) {
    return compareArray(value, where as ArrayComparison<JSONArray>);
  } else {
    return compareObject(value, where as ObjectComparison<JSONObject>);
  }
}
