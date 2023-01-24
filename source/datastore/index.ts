import z from "zod";
import { getLock, Lock } from "p-lock";
import { readJSON } from "read-json-safe";
import { writeJSON } from "write-json-safe";
import { removeFile } from "remove-file-safe";
import { Schema, DatabaseData, getDatabaseSchema, listTables, TableName } from "./schema.js";

export type DatastoreOptions = {
  /**
   * Don't cache the database file in memory.
   */
  noCache?: boolean;
};

export class Datastore<S extends Schema> {
  private lock: Lock;
  private cache: DatabaseData<S> | undefined;
  path: string;
  schema: S;
  options: DatastoreOptions;
  constructor(path: string, schema: S, options: DatastoreOptions = {}) {
    this.path = path;
    this.schema = schema;
    this.lock = getLock();
    this.options = {
      noCache: false,
      ...options
    };
  }
  tables(): TableName<S>[] {
    return listTables(this.schema);
  }
  private emptyDatabaseData(): DatabaseData<S> {
    return this.tables().reduce((retval, tableName) => {
      const tableSchema = this.schema[tableName];
      if(tableSchema instanceof z.ZodArray) {
        (retval[tableName] as []) = [];
      } else if(tableSchema instanceof z.ZodRecord) {
        retval[tableName] = {} as typeof retval[typeof tableName];
      }
      return retval;
    }, {} as DatabaseData<S>);
  }
  async version(): Promise<number> {
    const databaseData = await this.read();
    // eslint-disable-next-line no-underscore-dangle
    return databaseData._version ?? 0;
  }
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const release = await this.lock();
    // eslint-disable-next-line callback-return
    const result = await callback();
    release();
    return result;
  }
  async read(): Promise<DatabaseData<S>> {
    if(this.cache !== undefined) {
      return this.cache;
    } else {
      const json = await readJSON(this.path);
      const result = getDatabaseSchema(this.schema).safeParse(json);
      const data = (result.success ? (result.data as DatabaseData<S>) : this.emptyDatabaseData());
      if(!this.options.noCache) {
        this.cache = data;
      }
      return data;
    }
  }
  async write(data: DatabaseData<S>): Promise<void> {
    const success = await writeJSON(this.path, data);
    if(!success) {
      throw new Error("Failed to write.");
    } else if(!this.options.noCache) {
      this.cache = data;
    }
  }
  flush(): void {
    this.cache = undefined;
  }
  async drop(): Promise<void> {
    await this.write({});
    this.cache = undefined;
  }
  async erase(): Promise<void> {
    await removeFile(this.path);
    this.cache = undefined;
  }
}

export type {
  Schema,
  DatabaseData,
  TableName
};
