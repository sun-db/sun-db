import z from "zod";
import { JSONObject, JSONValue } from "types-json";
import { Schema, TableName } from "../index.js";
import { Table } from "./table.js";
import { QueryOne, Query, find, filter, map } from "./query.js";

export type ArrayTableSchema = z.ZodArray<z.ZodSchema<JSONValue>>;

export type ArrayTableName<S extends Schema> = {
  [N in TableName<S>]: S[N] extends ArrayTableSchema ? N : never;
}[TableName<S>];

export type ArrayTableItem<S extends Schema, N extends ArrayTableName<S>> = S[N] extends ArrayTableSchema
? z.infer<S[N]>[number]
: never;

export type ArrayTableData<S extends Schema, N extends ArrayTableName<S>> = ArrayTableItem<S, N>[];

export class ArrayTable<S extends Schema, N extends ArrayTableName<S>> extends Table<S, N> {
  private async read(): Promise<ArrayTableData<S, N>> {
    const databaseData = await this.datastore.read();
    return (databaseData[this.name] as ArrayTableData<S, N>) ?? {};
  }
  private async write(data: ArrayTableData<S, N>): Promise<void> {
    const databaseData = await this.datastore.read();
    (databaseData[this.name] as ArrayTableData<S, N>) = data;
    return this.datastore.write(databaseData);
  }
  /**
   * Return true if the item exists.
   */
  async exists(query: QueryOne<S, N>): Promise<boolean> {
    const table = await this.read();
    return find(table, query) !== undefined;
  }
  /**
   * Select all items that match the query.
   */
  async select(query?: Query<S, N>): Promise<ArrayTableData<S, N>> {
    const table = await this.read();
    return filter(table, query);
  }
  /**
   * Insert an item into the table.
   */
  async insert(item: ArrayTableItem<S, N>): Promise<void> {
    this.datastore.transaction(async () => {
      const table = await this.read();
      table.push(item);
      return this.write(table);
    });
  }
  /**
   * Update all items that match the query.
   * Returns the updated items.
   */
  async update(query: Query<S, N>, update: ArrayTableItem<S, N> extends JSONObject ? Partial<ArrayTableItem<S, N>> : ArrayTableItem<S, N>): Promise<ArrayTableData<S, N>> {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      const updated: ArrayTableData<S, N> = [];
      const result = map(table, query, (item) => {
        const transform = typeof item === "object" && item !== null ? Object.assign(item, update) : (update as ArrayTableItem<S, N>);
        updated.push(transform);
        return transform;
      });
      await this.write(result);
      return updated;
    });
  }
  /**
   * Delete all items that match the query.
   * Returns the deleted items.
   */
  async delete(query: Query<S, N>): Promise<ArrayTableData<S, N>> {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      const deleted: ArrayTableData<S, N> = [];
      const result = map(table, query, (item) => {
        deleted.push(item);
        return undefined;
      });
      await this.write(result);
      return deleted;
    });
  }
}
