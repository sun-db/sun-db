/* eslint-disable max-lines */
import z from "zod";
import { JSONValue } from "types-json";
import { Schema, TableName } from "../index.js";
import { Table } from "./table.js";
import { QueryOne, Query, DataQueryOne, DataQuery, PartialDataQuery, PartialDataQueryOne, find, filter, map } from "../query/index.js";
import { JSONObject } from "read-json-safe";
import { v4 as uuid } from "uuid";

export type ArrayTableSchema = z.ZodArray<z.ZodSchema<JSONValue>>;

export type ArrayTableName<S extends Schema> = {
  [N in TableName<S>]: S[N] extends ArrayTableSchema ? N : never;
}[TableName<S>];

export type ArrayTableItem<S extends Schema, N extends ArrayTableName<S>> = S[N] extends ArrayTableSchema
? z.infer<S[N]>[number]
: never;

export type InsertArrayTableItem<S extends Schema, N extends ArrayTableName<S>> = S[N] extends ArrayTableSchema
? OrSymbol<z.infer<S[N]>[number]>
: never;

type OrSymbol<T extends JSONValue> = T extends JSONObject
  ? { [K in keyof T]: T[K] | symbol; }
  : T | symbol;

export type ArrayTableData<S extends Schema, N extends ArrayTableName<S>> = ArrayTableItem<S, N>[];

export class ArrayTable<S extends Schema, N extends ArrayTableName<S>> extends Table<S, N> {
  // serialID = Symbol("serialID");
  uuid = Symbol("uuid");
  now = Symbol("now");
  private async read(): Promise<ArrayTableData<S, N>> {
    const databaseData = await this.datastore.read();
    return (databaseData[this.name] as ArrayTableData<S, N>) ?? {};
  }
  private async write(data: ArrayTableData<S, N>): Promise<void> {
    const databaseData = await this.datastore.read();
    (databaseData[this.name] as ArrayTableData<S, N>) = data;
    return this.datastore.write(databaseData);
  }
  private fillItem(item: symbol | JSONValue): JSONValue {
    if(typeof item === "symbol") {
      if(item === this.uuid) {
        return uuid();
      } else if(item === this.now) {
        return new Date().toISOString();
      } else {
        throw new Error("Invalid symbol");
      }
    } else if(typeof item === "object" && item !== null && !Array.isArray(item)) {
      return Object.entries(item).reduce((retval, [key, value]) => {
        if(value !== undefined) {
          retval[key] = this.fillItem(value);
        }
        return retval;
      }, {} as JSONObject);
    } else {
      return item;
    }
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
   * Select the first item that matches the query.
   */
  async selectFirst(query?: QueryOne<S, N>): Promise<ArrayTableItem<S, N> | undefined> {
    const table = await this.read();
    return find(table, query);
  }
  /**
   * Insert an item into the table.
   */
  async insert(item: InsertArrayTableItem<S, N>): Promise<void> {
    await this.datastore.transaction(async () => {
      const table = await this.read();
      table.push(this.fillItem(item as symbol | JSONValue) as ArrayTableItem<S, N>);
      return this.write(table);
    });
  }
  /**
   * Insert multiple items into the table.
   */
  async insertAll(items: ArrayTableItem<S, N>[]): Promise<void> {
    await this.datastore.transaction(async () => {
      const table = await this.read();
      table.push(...items);
      return this.write(table);
    });
  }
  /**
   * Update all items that match the query. If no items match, insert the item.
   * Returns the updated items.
   */
  async upsert(query: DataQuery<S, N>): Promise<ArrayTableData<S, N>> {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      const updated: ArrayTableData<S, N> = [];
      const result = map(table, query, (item) => {
        const transform = typeof item === "object" && item !== null ? Object.assign(item, query.data) : (query.data as ArrayTableItem<S, N>);
        updated.push(transform);
        return transform;
      });
      if(updated.length === 0) {
        result.push(query.data);
        updated.push(query.data);
      }
      await this.write(result);
      return updated;
    });
  }
  /**
   * Update the first item that matches the query.
   * If no item matches the query, insert the item.
   */
  async upsertFirst(query: DataQueryOne<S, N>): Promise<ArrayTableItem<S, N>> {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      // eslint-disable-next-line no-undef-init
      let updated: ArrayTableItem<S, N> | undefined = undefined;
      const result = map(table, { ...query, limit: 1 }, (item) => {
        const transform = typeof item === "object" && item !== null ? Object.assign(item, query.data) : (query.data as ArrayTableItem<S, N>);
        updated = transform;
        return transform;
      });
      if(updated === undefined) {
        result.push(query.data);
        updated = query.data;
      }
      await this.write(result);
      return updated;
    });
  }
  /**
   * Update all items that match the query.
   * Returns the updated items.
   */
  async update(query: PartialDataQuery<S, N>): Promise<ArrayTableData<S, N>> {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      const updated: ArrayTableData<S, N> = [];
      const result = map(table, query, (item) => {
        const transform = typeof item === "object" && item !== null ? Object.assign(item, query.data) : (query.data as ArrayTableItem<S, N>);
        updated.push(transform);
        return transform;
      });
      await this.write(result);
      return updated;
    });
  }
  /**
   * Update the first item that matches the query.
   * Returns the updated item. If no item matches the query, returns undefined.
   */
  async updateFirst(query: PartialDataQueryOne<S, N>): Promise<ArrayTableItem<S, N> | undefined> {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      // eslint-disable-next-line no-undef-init
      let updated: ArrayTableItem<S, N> | undefined = undefined;
      const result = map(table, { ...query, limit: 1 }, (item) => {
        const transform = typeof item === "object" && item !== null ? Object.assign(item, query.data) : (query.data as ArrayTableItem<S, N>);
        updated = transform;
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
  async delete(query?: Query<S, N>): Promise<ArrayTableData<S, N>> {
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
  /**
   * Delete the first item that matches the query.
   * Returns the deleted item. If no item matches the query, returns undefined.
   */
  async deleteFirst(query: QueryOne<S, N>): Promise<ArrayTableItem<S, N> | undefined> {
    return this.datastore.transaction(async () => {
      const table = await this.read();
      // eslint-disable-next-line no-undef-init
      let deleted: ArrayTableItem<S, N> | undefined = undefined;
      const result = map(table, { ...query, limit: 1 }, (item) => {
        deleted = item;
        return undefined;
      });
      await this.write(result);
      return deleted;
    });
  }
  /**
   * Remove all items from the table.
   */
  async truncate(): Promise<void> {
    return this.datastore.transaction(async () => {
      await this.write([]);
    });
  }
}
