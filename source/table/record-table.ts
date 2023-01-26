import z from "zod";
import { NestedOptionalJSONValue } from "types-json";
import { uuid, now, serialID } from "../symbol.js";
import { Schema, TableName } from "../index.js";
import { Table } from "./table.js";

export type RecordTableSchema = z.ZodRecord<z.ZodString, z.ZodSchema<NestedOptionalJSONValue>>;

type RecordKey<R extends Record<string, NestedOptionalJSONValue>> = R extends Record<infer K, NestedOptionalJSONValue>
  ? K extends string
    ? K
    : never
  : never;

type RecordValue<R extends Record<string, NestedOptionalJSONValue>> = R extends Record<string, infer V>
  ? V
  : never;

export type RecordTableName<S extends Schema> = Extract<{
  [N in TableName<S>]: S[N] extends RecordTableSchema ? N : never;
}[TableName<S>], TableName<S>>;

export type RecordTableKey<S extends Schema, N extends RecordTableName<S>> = S[N] extends RecordTableSchema
  ? RecordKey<z.infer<S[N]>>
  : never;

export type RecordTableValue<S extends Schema, N extends RecordTableName<S>> = S[N] extends RecordTableSchema
  ? RecordValue<z.infer<S[N]>>
  : never;

export type RecordTableData<S extends Schema, N extends RecordTableName<S>> = {
  [Key in RecordTableKey<S, N>]: RecordTableValue<S, N>;
};

export class RecordTable<S extends Schema, N extends TableName<S> & RecordTableName<S>> extends Table<S, N> {
  private async read(): Promise<RecordTableData<S, N>> {
    const databaseData = await this.datastore.read();
    return (databaseData[this.name] as RecordTableData<S, N>) ?? {};
  }
  private async write(data: RecordTableData<S, N>): Promise<void> {
    const databaseData = await this.datastore.read();
    (databaseData[this.name] as RecordTableData<S, N>) = data;
    return this.datastore.write(databaseData);
  }
  private async hydrateSymbol(key: symbol | RecordTableKey<S, N>): Promise<RecordTableKey<S, N>> {
    if(typeof key === "symbol") {
      if(key === this.uuid) {
        const table = await this.read();
        return uuid(Object.keys(table)) as RecordTableKey<S, N>;
      } else if(key === this.serialID) {
        const table = await this.read();
        return serialID(Object.keys(table)) as RecordTableKey<S, N>;
      } else if(key === this.now) {
        return now() as RecordTableKey<S, N>;
      } else {
        throw new Error("Invalid Symbol");
      }
    } else {
      return key;
    }
  }
  /**
   * Returns true if the key exists.
   */
  async has(key: RecordTableKey<S, N>): Promise<boolean> {
    const table = await this.read();
    return key in table;
  }
  /**
   * Get a value by key.
   * Returns undefined if the record doesn't exist.
   */
  async get(key: RecordTableKey<S, N>): Promise<RecordTableValue<S, N> | undefined> {
    const table = await this.read();
    return table[key];
  }
  /**
   * Add a new record if the provided key doesn't exist.
   * Returns the new key/value pair if it was created, or undefined if it already exists.
   */
  async add(key: RecordTableKey<S, N> | symbol, value: RecordTableValue<S, N>): Promise<[RecordTableKey<S, N>, RecordTableValue<S, N>] | undefined> {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      const hydratedKey = await this.hydrateSymbol(key);
      if(table[hydratedKey] === undefined) {
        table[hydratedKey] = value;
        await this.write(table);
        return [hydratedKey, value];
      } else {
        return undefined;
      }
    });
  }
  /**
   * Set a key to a value.
   * Returns the new value.
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
   * Replace a key with a value.
   * Returns the new value if the key existed, or undefined if it didn't.
   */
  async replace(key: RecordTableKey<S, N>, value: RecordTableValue<S, N>) {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      if(table[key]) {
        table[key] = value;
        await this.write(table);
        return value;
      } else {
        return undefined;
      }
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
  /**
   * Remove all records.
   */
  async clear() {
    return this.datastore.transaction(async () => {
      await this.write({} as RecordTableData<S, N>);
    });
  }
}
