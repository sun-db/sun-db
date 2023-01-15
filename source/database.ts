import z from "zod";
import { resolve } from "path";
import { JSONValue, readJSON, JSONObject } from "read-json-safe";
import { writeJSON } from "write-json-safe";
import { isJSONObject } from "types-json";
import { getLock, Lock } from "p-lock";

export type Schema = {
  [key: string]: z.ZodSchema;
};

type Key = string | number;

type Value = JSONValue;

type Table<V extends Value> = {
  get: (key: Key) => Promise<V | undefined>;
  set: (key: Key, value: V) => Promise<void>;
  delete: (key: Key) => Promise<void>;
  select: () => Promise<V>;
};

type KeyOf<S extends Schema> = keyof S & string;

type ValueOf<S extends Schema, K extends KeyOf<S>> = S[K]["_type"];

type JSONClient<S extends Schema> = {
  [K in KeyOf<S>]: Table<ValueOf<S, K>>;
};

export class JSONDatabase<S extends Schema> {
  private path: string;
  schema: Schema;
  client: JSONClient<S>;
  lock: Lock;
  constructor(path: string, schema: S) {
    this.path = resolve(path);
    this.schema = schema;
    this.client = this.getClient();
    this.lock = getLock();
  }
  listTables(): KeyOf<S>[] {
    return Object.keys(this.schema);
  }
  private getClient(): JSONClient<S> {
    return this.listTables().reduce((client, tableName) => {
      client[tableName] = this.getTable(tableName);
      return client;
    }, {} as JSONClient<S>);
  }
  private async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const release = await this.lock();
    const result = await callback();
    release();
    return result;
  }
  private getTable<K extends KeyOf<S>>(tableName: K): Table<ValueOf<S, K>> {
    return {
      get: async (key: Key) => {
        const table = await this.read(tableName);
        return table?.[key];
      },
      set: async (key: Key, value: ValueOf<S, K>) => {
        return this.transaction(async () => {
          const table = await this.read(tableName) ?? {};
          table[key] = value;
          await this.write(tableName, table);
        });
      },
      delete: async (key: Key) => {
        return this.transaction(async () => {
          const table = await this.read(tableName) ?? {};
          delete table[key];
          await this.write(tableName, table);
        });
      },
      select: async () => {
        return this.read(tableName);
      }
    };
  }
  private async read<K extends KeyOf<S>>(tableName: K): Promise<ValueOf<S, K> | undefined> {
    const json = await readJSON(this.path);
    const result = z.record(z.string(), this.schema[tableName]).safeParse(isJSONObject(json) ? json[tableName] : {});
    return result.success ? result.data : undefined;
  }
  private async write<K extends KeyOf<S>>(tableName: K, data: ValueOf<S, K>): Promise<void> {
    let json = await readJSON(this.path);
    if(isJSONObject(json)) {
      json[tableName] = data;
    } else {
      json = { [tableName]: data };
    }
    await writeJSON(this.path, json);
  }
}
