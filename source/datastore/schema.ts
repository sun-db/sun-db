import z from "zod";
import { OptionalJSONValue } from "types-json";

// Metadata

export type MetadataSchema = typeof metadataSchema;

type Metadata = {
  [K in keyof typeof metadataSchema]?: z.infer<typeof metadataSchema[K]>;
};

const metadataSchema = {
  _version: z.number().optional()
};

// Schema

type TableSchema = z.ZodSchema<OptionalJSONValue>;

/**
 * A schema describing the tables in a database.
 */
export type Schema = {
  [tableName: string]: TableSchema;
} & {
  [illegal: `_${string}`]: never;
};

export function getDatabaseSchema<S extends Schema>(schema: S) {
  return z.object({
    ...schema,
    ...metadataSchema
  }).partial();
}

// Data

type TablesData<S extends Schema> = {
  [N in keyof S]: z.infer<S[N]> | undefined;
};

export type TableName<S extends Schema> = Extract<keyof S, string>;

export type TableData<S extends Schema, N extends TableName<S>> = TablesData<S>[N];

export type DatabaseData<S extends Schema> = Partial<TablesData<S>> & Metadata;

export function listTables<S extends Schema>(schema: S) {
  return Object.keys(schema) as TableName<S>[];
}
