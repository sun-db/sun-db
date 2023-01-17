import z from "zod";
import { getLock, Lock } from "p-lock";
import { readJSON } from "read-json-safe";
import { writeJSON } from "write-json-safe";
import { removeFile } from "remove-file-safe";
import { Schema, TableName } from "./index.js";
import { isMetadataKey, Metadata } from "./metadata.js";
import { TableData } from "./table/index.js";

export type DatabaseData<S extends Schema> = {
  [K in TableName<S>]: TableData<S, K>;
} & Metadata;

export class DataStore<S extends Schema> {
  private path: string;
  private schema: S;
  private lock: Lock;
  constructor(path: string, schema: S) {
    this.path = path;
    this.schema = schema;
    this.lock = getLock();
  }
  private databaseSchema() {
    return z.object(
      Object.keys(this.schema).reduce((retval, tableName) => {
        retval[tableName] = this.schema[tableName];
        return retval;
      }, {})
    );
  }
  private emptyDatabaseData(): DatabaseData<S> {
    return this.listTables().reduce((retval, tableName) => {
      const tableSchema = this.schema[tableName];
      if(tableSchema instanceof z.ZodArray) {
        retval[tableName] = {}; // as ArrayTableData<ArrayTableSchema>
      } else if(tableSchema instanceof z.ZodRecord) {
        retval[tableName] = [];
      }
      return retval;
    }, {} as DatabaseData<S>);
  }
  async version(): Promise<number> {
    const databaseData = await this.read();
    // eslint-disable-next-line no-underscore-dangle
    return databaseData._version ?? 0;
  }
  listTables(): TableName<S>[] {
    return Object.keys(this.schema).filter((name) => !isMetadataKey(name)) as TableName<S>[];
  }
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const release = await this.lock();
    // eslint-disable-next-line callback-return
    const result = await callback();
    release();
    return result;
  }
  async read(): Promise<DatabaseData<S>> {
    const json = await readJSON(this.path);
    const result = this.databaseSchema().safeParse(json);
    return result.success ? result.data as DatabaseData<S> : this.emptyDatabaseData();
  }
  async write(data: DatabaseData<S>): Promise<void> {
    const success = await writeJSON(this.path, data);
    if(!success) {
      throw new Error("Failed to write.");
    }
  }
  async drop(): Promise<void> {
    await this.write({} as DatabaseData<S>);
  }
  async erase(): Promise<void> {
    await removeFile(this.path);
  }
}
