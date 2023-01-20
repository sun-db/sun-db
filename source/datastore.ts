import z from "zod";
import { getLock, Lock } from "p-lock";
import { readJSON } from "read-json-safe";
import { writeJSON } from "write-json-safe";
import { removeFile } from "remove-file-safe";
import { Schema, TableName } from "./index.js";
import { isMetadataKey, Metadata } from "./metadata.js";
import { TableData, TableSchema } from "./table/index.js";

export type DatabaseData<S extends Schema> = {
  [K in TableName<S>]: TableData<S, K>;
} & Metadata;

export type DatastoreOptions = {
  /**
   * Don't cache the database file in memory.
   */
  noCache?: boolean;
};

export class Datastore<S extends Schema> {
  private lock: Lock;
  private cache: DatabaseData<S> | undefined = undefined;
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
  private databaseSchema() {
    return z.object(
      Object.keys(this.schema).reduce((retval, tableName) => {
        retval[(tableName as TableName<S>)] = this.schema[tableName] as TableSchema;
        return retval;
      }, {} as {
        [K in TableName<S>]: TableSchema;
      })
    );
  }
  private emptyDatabaseData(): DatabaseData<S> {
    return this.tables().reduce((retval, tableName) => {
      const tableSchema = this.schema[tableName];
      if(tableSchema instanceof z.ZodArray) {
        (retval[tableName] as any) = [];
      } else if(tableSchema instanceof z.ZodRecord) {
        (retval[tableName] as any) = {};
      }
      return retval;
    }, {} as DatabaseData<S>);
  }
  async version(): Promise<number> {
    const databaseData = await this.read();
    // eslint-disable-next-line no-underscore-dangle
    return databaseData._version ?? 0;
  }
  tables(): TableName<S>[] {
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
    if(this.cache !== undefined) {
      return this.cache;
    } else {
      const json = await readJSON(this.path);
      const result = this.databaseSchema().safeParse(json);
      const data = result.success ? result.data as DatabaseData<S> : this.emptyDatabaseData();
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
    await this.write({} as DatabaseData<S>);
    this.cache = undefined;
  }
  async erase(): Promise<void> {
    await removeFile(this.path);
    this.cache = undefined;
  }
}
