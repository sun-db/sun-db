import { Schema, TableName } from "../index.js";
import type { ArrayTableSchema, ArrayTableItem, ArrayTableName, ArrayTableData } from "./array-table.js";
import type { RecordTableSchema, RecordTableValue, RecordTableName, RecordTableData } from "./record-table.js";

export type TableSchema = ArrayTableSchema | RecordTableSchema;

export type TableRecord<S extends Schema, N extends TableName<S>> = N extends ArrayTableName<S>
  ? ArrayTableItem<S, N>
  : N extends RecordTableName<S>
    ? RecordTableValue<S, N>
    : never;

export type TableData<S extends Schema, N extends TableName<S>> = N extends ArrayTableName<S>
  ? ArrayTableData<S, N>
  : N extends RecordTableName<S>
    ? RecordTableData<S, N>
    : never;

export { ArrayTable } from "./array-table.js";
export { RecordTable } from "./record-table.js";

export type {
  ArrayTableSchema,
  ArrayTableItem,
  ArrayTableName,
  ArrayTableData,
  RecordTableSchema,
  RecordTableValue,
  RecordTableName,
  RecordTableData
};
