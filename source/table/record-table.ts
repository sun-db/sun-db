import z from "zod";
import { JSONValue } from "types-json";
import { Schema, TableName } from "../index.js";
import { Table } from "./table.js";

export type RecordTableSchema = z.ZodRecord<z.ZodString, z.ZodSchema<JSONValue>>;

type RecordKey<R extends Record<string, JSONValue>> = R extends Record<infer K, JSONValue>
  ? K extends string
    ? K
    : never
  : never;

type RecordValue<R extends Record<string, JSONValue>> = R extends Record<string, infer V>
  ? V
  : never;

export type RecordTableName<S extends Schema> = S[keyof S] extends RecordTableSchema
  ? TableName<S>
  : never;

export type RecordTableKey<S extends Schema, N extends RecordTableName<S>> = S[N] extends RecordTableSchema
  ? RecordKey<z.infer<S[N]>>
  : never;

export type RecordTableValue<S extends Schema, N extends RecordTableName<S>> = S[N] extends RecordTableSchema
  ? RecordValue<z.infer<S[N]>>
  : never;

export type RecordTableData<S extends Schema, N extends RecordTableName<S>> = {
  [Key in RecordTableKey<S, N>]: RecordTableValue<S, N>;
};

export class RecordTable<S extends Schema, N extends RecordTableName<S>> extends Table<S, N> {
  private async read(): Promise<RecordTableData<S, N>> {
    const databaseData = await this.datastore.read();
    return (databaseData[this.name] as RecordTableData<S, N>) ?? {};
  }
  private async write(data: RecordTableData<S, N>): Promise<void> {
    const databaseData = await this.datastore.read();
    (databaseData[this.name] as RecordTableData<S, N>) = data;
    return this.datastore.write(databaseData);
  }
  /**
   * Get a record by key.
   * Returns undefined if the record doesn't exist.
   */
  async get(key: RecordTableKey<S, N>): Promise<RecordTableValue<S, N> | undefined> {
    const table = await this.read();
    return table[key];
  }
  /**
   * Create a new record if it doesn't exist.
   * Returns the new record if it was created, or undefined if it already exists.
   */
  async create(key: RecordTableKey<S, N>, value: RecordTableValue<S, N>): Promise<RecordTableValue<S, N> | undefined> {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      if(table[key]) {
        return undefined;
      } else {
        table[key.toString()] = value;
        await this.write(table);
        return value;
      }
    });
  }
  /**
   * Set a record to a value by key.
   * Returns the new record.
   */
  async set(key: RecordTableKey<S, N>, value: RecordTableValue<S, N>) {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      table[key] = value;
      await this.write(table);
      return value;
    });
  }
  /**
   * Remove a record by key.
   * Returns the removed record.
   */
  async remove(key: RecordTableKey<S, N>) {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      const value = table[key];
      delete table[key];
      await this.write(table);
      return value;
    });
  }
}
