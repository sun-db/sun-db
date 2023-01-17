import z from "zod";
import { getLock, Lock } from "p-lock";
import { readJSON } from "read-json-safe";
import { writeJSON } from "write-json-safe";
import { removeFile } from "remove-file-safe";
import { Schema, DatabaseData, TableName, TableData } from "./index.js";

function getTable<S extends Schema, T extends TableName<S>>(data: DatabaseData<S>, tableName: T) {
  return data[tableName] as TableData<S[T]>;
}

function setTable<S extends Schema, T extends TableName<S>>(data: DatabaseData<S>, tableName: T, tableData: TableData<S[T]>) {
  (data[tableName] as TableData<S[T]>) = tableData;
}

export class DataStore<S extends Schema> {
  private path: string;
  private schema: Schema;
  private lock: Lock;
  constructor(path: string, schema: Schema) {
    this.path = path;
    this.schema = schema;
    this.lock = getLock();
  }
  private tableSchema(tableName: TableName<S>) {
    return z.record(z.string(), z.object(this.schema[tableName]));
  }
  private databaseSchema() {
    return z.object(
      Object.keys(this.schema).reduce((retval, tableName) => {
        retval[tableName] = this.tableSchema(tableName);
        return retval;
      }, {})
    );
  }
  private emptyDatabaseData(): DatabaseData<S> {
    return this.listTables().reduce((retval, tableName) => {
      setTable(retval, tableName, {});
      return retval;
    }, {} as DatabaseData<S>);
  }
  async version(): Promise<number> {
    const databaseData = await this.read();
    // eslint-disable-next-line no-underscore-dangle
    return databaseData._version ?? 0;
  }
  listTables(): TableName<S>[] {
    return Object.keys(this.schema).filter((name) => {
      return name !== "_version";
    }) as TableName<S>[];
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
  async readTable<K extends TableName<S>>(tableName: K): Promise<TableData<S[K]>> {
    const databaseData = await this.read();
    return getTable(databaseData, tableName) ?? {};
  }
  async write(data: DatabaseData<S>): Promise<void> {
    const success = await writeJSON(this.path, data);
    if(!success) {
      throw new Error("Failed to write.");
    }
  }
  async writeTable<K extends TableName<S>>(tableName: K, data: TableData<S[K]>): Promise<void> {
    const databaseData = await this.read();
    setTable(databaseData, tableName, data);
    return this.write(databaseData);
  }
  async drop(): Promise<void> {
    await this.write({} as DatabaseData<S>);
  }
  async dropTable<K extends TableName<S>>(tableName: K): Promise<void> {
    const databaseData = await this.read();
    delete databaseData[tableName];
    return this.write(databaseData);
  }
  async remove(): Promise<void> {
    await removeFile(this.path);
  }
}
