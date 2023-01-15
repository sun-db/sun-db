import z from "zod";
import { DataStore } from "./datastore.js";
import { Table } from "./table.js";

export type Schema = {
  [key: string]: z.ZodSchema;
};

export type TableName<S extends Schema> = keyof S & string;

export type TableValue<S extends Schema, K extends TableName<S>> = S[K]["_type"];

export type SunClient<S extends Schema> = {
  [K in TableName<S>]: Table<S, TableValue<S, K>>;
};

export class SunDB<S extends Schema> {
  private datastore: DataStore<S>;
  client: SunClient<S>;
  constructor(path: string, schema: S) {
    this.datastore = new DataStore(path, schema);
    this.client = this.listTables().reduce((client, tableName) => {
      client[tableName] = new Table(this.datastore, tableName);
      return client;
    }, {} as SunClient<S>)
  }
  listTables(): TableName<S>[] {
    return this.datastore.listTables();
  }
}
