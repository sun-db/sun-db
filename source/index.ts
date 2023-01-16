import z from "zod";
import { JSONValue } from "types-json";
import { DataStore } from "./datastore.js";
import { Table } from "./table.js";

type TableSchema = {
  [key: string]: z.ZodSchema<JSONValue>;
};

export type Schema = {
  [key: string]: TableSchema;
};

export type TableName<S extends Schema> = keyof S & string;

export type TableData<T extends TableSchema> = {
  [key: string]: TableRecord<T>;
}

export type TableRecord<T extends TableSchema> = {
  [F in keyof T]: T[F]["_type"];
};

export type SunClient<S extends Schema> = {
  [K in TableName<S>]: Table<S, K>;
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
