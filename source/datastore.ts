import z from "zod";
import { getLock, Lock } from "p-lock";
import { readJSON } from "read-json-safe";
import { writeJSON } from "write-json-safe";
import { isJSONObject } from "types-json";
import { Schema, TableName, TableValue } from "./index.js";

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
  async read<K extends TableName<S>>(tableName: K): Promise<TableValue<S, K> | undefined> {
    const json = await readJSON(this.path);
    const result = z.record(z.string(), this.schema[tableName]).safeParse(isJSONObject(json) ? json[tableName] : {});
    return result.success ? result.data : undefined;
  }
  async write<K extends TableName<S>>(tableName: K, data: TableValue<S, K>): Promise<void> {
    let json = await readJSON(this.path);
    if(isJSONObject(json)) {
      json[tableName] = data;
    } else {
      json = { [tableName]: data };
    }
    await writeJSON(this.path, json);
  }
}
