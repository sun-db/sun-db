import { Schema, TableName, TableRecord } from "./index.js";
import { DataStore } from "./datastore.js";

type Key = string | number;

type Options = {
  limit?: number;
  offset?: number;
};

export class Table<S extends Schema, K extends TableName<S>> {
  private datastore: DataStore<S>;
  name: K;
  constructor(datastore: DataStore<S>, name: K) {
    this.datastore = datastore;
    this.name = name;
  }
  /**
   * Drop the table entirely.
   */
  async drop() {
    return this.datastore.transaction(async () => {
      await this.datastore.dropTable(this.name);
    });
  }
  /**
   * Get a record by key.
   * Returns undefined if the record doesn't exist.
   */
  async get(key: Key): Promise<TableRecord<S[K]> | undefined> {
    const table = await this.datastore.readTable(this.name);
    return table[key];
  }
  /**
   * Create a new record if it doesn't exist.
   * Returns the new record if it was created, or undefined if it already exists.
   */
  async create(key: Key, value: TableRecord<S[K]>): Promise<TableRecord<S[K]> | undefined> {
    return this.datastore.transaction(async () => {
      const table = await this.datastore.readTable(this.name);
      if(table[key]) {
        return undefined;
      } else {
        table[key.toString()] = value;
        await this.datastore.writeTable(this.name, table);
        return value;
      }
    });
  }
  /**
   * Set a record to a value by key.
   * Returns the new record.
   */
  async set(key: Key, value: TableRecord<S[K]>) {
    return this.datastore.transaction(async () => {
      const table = await this.datastore.readTable(this.name) ?? {};
      table[key] = value;
      await this.datastore.writeTable(this.name, table);
      return value;
    });
  }
  /**
   * Remove a record by key.
   * Returns the removed record.
   */
  async remove(key: Key) {
    return this.datastore.transaction(async () => {
      const table = await this.datastore.readTable(this.name) ?? {};
      const value = table[key];
      delete table[key];
      await this.datastore.writeTable(this.name, table);
      return value;
    });
  }
  async select(options: Options) {
    const table = await this.datastore.readTable(this.name);
    return table;
  }
}
