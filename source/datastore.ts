import z from "zod";
import { getLock, Lock } from "p-lock";
import { readJSON } from "read-json-safe";
import { writeJSON } from "write-json-safe";
import { isJSONObject } from "types-json";
import { Schema, TableName, TableData, TableRecord } from "./index.js";

export class DataStore<S extends Schema> {
  private path: string;
  private schema: Schema;
  private lock: Lock;
  constructor(path: string, schema: Schema) {
    this.path = path;
    this.schema = schema;
    this.lock = getLock();
  }
  listTables(): TableName<S>[] {
    return Object.keys(this.schema);
  }
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const release = await this.lock();
    const result = await callback();
    release();
    return result;
  }
  async read<K extends TableName<S>>(tableName: K): Promise<TableData<S[K]>> {
    const json = await readJSON(this.path);
    if(isJSONObject(json)) {
      const result = z.record(z.string(), z.object(this.schema[tableName])).safeParse(json[tableName]);
      return (result.success ? result.data : {}) as TableData<S[K]>;
    } else {
      return {};
    }
  }
  async write<K extends TableName<S>>(tableName: K, data: TableData<S[K]>): Promise<void> {
    let json = await readJSON(this.path);
    if(isJSONObject(json)) {
      json[tableName] = data;
    } else {
      json = { [tableName]: data };
    }
    const success = await writeJSON(this.path, json);
    if(!success) {
      throw new Error("Failed to write.");
    }
  }
}
