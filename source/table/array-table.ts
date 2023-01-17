import z from "zod";
import { JSONValue } from "types-json";
import { Schema, TableName } from "../index.js";
import { Table } from "./table.js";

export type ArrayTableSchema = z.ZodArray<z.ZodSchema<JSONValue>>;

type ArrayItem<S extends Array<JSONValue>> = S extends Array<infer T>
  ? T
  : never;

export type ArrayTableName<S extends Schema> = S[keyof S] extends ArrayTableSchema
  ? TableName<S>
  : never;

export type ArrayTableItem<S extends Schema, N extends ArrayTableName<S>> = S[N] extends ArrayTableSchema
  ? ArrayItem<z.infer<S[N]>>
  : never;

export type ArrayTableData<S extends Schema, N extends ArrayTableName<S>> = S[N] extends ArrayTableSchema
  ? Array<z.infer<S[N]>>
  : never;

export class ArrayTable<S extends Schema, K extends TableName<S>> extends Table<S, K> {
  // TODO
}
