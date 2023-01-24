/* eslint-disable max-lines */
import z from "zod";
import { JSONValue, JSONObject } from "types-json";
import { v4 as uuid } from "uuid";
import { Schema, TableName } from "../index.js";
import { Table } from "./table.js";
import { QueryOne, Query, DataQueryOne, DataQuery, PartialDataQuery, PartialDataQueryOne, find, filter, map } from "../query/index.js";
import { OrSymbol, valueAtPath } from "../symbol.js";
import { OptionalJSONValue } from "../utils.js";

export type ArrayTableSchema = z.ZodArray<z.ZodSchema<OptionalJSONValue>>;

export type ArrayTableName<S extends Schema> = Extract<{
  [N in TableName<S>]: S[N] extends ArrayTableSchema ? N : never;
}[TableName<S>], TableName<S>>;

export type ArrayTableItem<S extends Schema, N extends ArrayTableName<S>> = S[N] extends ArrayTableSchema
? z.infer<S[N]>[number]
: never;

export type ArrayTableItemInput<S extends Schema, N extends ArrayTableName<S>> = S[N] extends ArrayTableSchema
? OrSymbol<z.infer<S[N]>[number]>
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
  private async generateSerialID(path: string[]): Promise<string> {
    const data = await this.read();
    const ids = data.map((item) => {
      const value = valueAtPath(item, path);
      return value ? parseInt(value.toString()) : NaN;
    }).filter((id) => !isNaN(id));
    const max = Math.max(0, ...ids);
    return (max + 1).toString();
  }
  private async hydrateInput(item: symbol | JSONValue, path: string[] = []): Promise<JSONValue> {
    if(typeof item === "symbol") {
      if(item === this.uuid) {
        return uuid();
      } else if(item === this.now) {
        return new Date().toISOString();
      } else if(item === this.serialID) {
        return this.generateSerialID(path);
      } else {
        throw new Error("Invalid symbol");
      }
    } else if(typeof item === "object" && item !== null && !Array.isArray(item)) {
      return Object.entries(item).reduce(async (retval, [key, value]) => {
        return retval.then(async (result) => {
          if(value !== undefined) {
            result[key] = await this.hydrateInput(value, [...path, key]);
          }
          return result;
        });
      }, Promise.resolve({} as JSONObject));
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
  async insert(item: ArrayTableItemInput<S, N>): Promise<void> {
    await this.datastore.transaction(async () => {
      const table = await this.read();
      const value = await this.hydrateInput(item as symbol | JSONValue) as ArrayTableItem<S, N>;
      table.push(value);
      return this.write(table);
    });
  }
  /**
   * Insert multiple items into the table.
   */
  async insertAll(items: ArrayTableItemInput<S, N>[]): Promise<void> {
    await this.datastore.transaction(async () => {
      const table = await this.read();
      const promises = items.map((item) => this.hydrateInput(item as symbol | JSONValue)) as Promise<ArrayTableItem<S, N>>[];
      const values = await Promise.all(promises);
      table.push(...values);
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
      const value = await this.hydrateInput(query.data as symbol | JSONValue) as ArrayTableItem<S, N>;
      const result = map(table, query, (item) => {
        const transform = typeof item === "object" && item !== null ? Object.assign(item, value) : (value as ArrayTableItem<S, N>);
        updated.push(transform);
        return transform;
      });
      if(updated.length === 0) {
        result.push(value);
        updated.push(value);
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
      const value = await this.hydrateInput(query.data as symbol | JSONValue) as ArrayTableItem<S, N>;
      const result = map(table, { ...query, limit: 1 }, (item) => {
        const transform = typeof item === "object" && item !== null ? Object.assign(item, value) : (value as ArrayTableItem<S, N>);
        updated = transform;
        return transform;
      });
      if(updated === undefined) {
        result.push(value);
        updated = value;
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
      const value = await this.hydrateInput(query.data as symbol | JSONValue) as ArrayTableItem<S, N>;
      const result = map(table, query, (item) => {
        const transform = typeof item === "object" && item !== null ? Object.assign(item, value) : (value as ArrayTableItem<S, N>);
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
      const value = await this.hydrateInput(query.data as symbol | JSONValue) as ArrayTableItem<S, N>;
      const result = map(table, { ...query, limit: 1 }, (item) => {
        const transform = typeof item === "object" && item !== null ? Object.assign(item, value) : (value as ArrayTableItem<S, N>);
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
