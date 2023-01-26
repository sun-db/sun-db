import { NestedOptionalJSONObject } from "types-json";
import { Schema } from "../index.js";
import { ArrayTableData, ArrayTableItem, ArrayTableName } from "../table/array-table.js";

export type SortOrder<FieldName extends string> =
  | `${FieldName}_asc`
  | `${FieldName}_desc`
  | `${FieldName}_asc_nullish_first`
  | `${FieldName}_desc_nullish_first`
  | `${FieldName}_asc_nullish_last`
  | `${FieldName}_desc_nullish_last`;

export type OrderBy<FieldName extends string> = Array<SortOrder<FieldName>> | SortOrder<FieldName>;

type SortablePrimitiveKeys<T> = T extends NestedOptionalJSONObject
  ? { [K in keyof T]: T[K] extends (string | number | null) ? K : never }[keyof T extends string ? keyof T : never]
  : never;

export type OrderByQuery<S extends Schema, N extends ArrayTableName<S>> = ArrayTableItem<S, N> extends NestedOptionalJSONObject
  ? { orderBy?: OrderBy<SortablePrimitiveKeys<ArrayTableItem<S, N>>>; }
  : { orderBy?: never; };

export function sort<S extends Schema, N extends ArrayTableName<S>>(array: ArrayTableData<S, N>, query?: OrderByQuery<S, N>) {
  if(query?.orderBy === undefined) {
    return array;
  } else {
    const orderBy = Array.isArray(query.orderBy) ? query.orderBy : [query.orderBy];
    return [...array].sort((a, b) => {
      for(const field of orderBy) {
        const [name, order, _, nulls] = field.split("_") as [string, "asc" | "desc"] | [string, "asc" | "desc", "nullish", "first" | "last"];
        const valueA = (a as NestedOptionalJSONObject)[name];
        const valueB = (b as NestedOptionalJSONObject)[name];
        if(valueA === undefined || valueA === null) {
          return nulls === "first" ? -1 : 1;
        } else if(valueB === undefined || valueB === null) {
          return nulls === "first" ? 1 : -1;
        } else if(valueA < valueB) {
          return order === "asc" ? -1 : 1;
        } else if(valueA > valueB) {
          return order === "asc" ? 1 : -1;
        }
      }
      return 0;
    });
  }
}
