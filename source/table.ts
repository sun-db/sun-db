import z from "zod";
import { DataStore } from "./datastore.js";
import { TableName, TableValue } from "./index.js";

export type Schema = {
  [key: string]: z.ZodSchema;
};

type Key = string | number;

export class Table<S extends Schema, K extends TableName<S>> {
  private datastore: DataStore<S>;
  name: string;
  constructor(datastore: DataStore<S>, name: K) {
    this.datastore = datastore;
    this.name = name;
  }
  async get(key: Key) {
    const table = await this.datastore.read(this.name);
    return table?.[key];
  }
  async set(key: Key, value: TableValue<S, K>) {
    return this.datastore.transaction(async () => {
      const table = await this.datastore.read(this.name) ?? {};
      table[key] = value;
      await this.datastore.write(this.name, table);
    });
  }
  async delete(key: Key) {
    return this.datastore.transaction(async () => {
      const table = await this.datastore.read(this.name) ?? {};
      delete table[key];
      await this.datastore.write(this.name, table);
    });
  }
  async select () {
    return this.datastore.read(this.name);
  }
}
