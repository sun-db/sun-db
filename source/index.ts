import { DataStore } from "./datastore.js";
import { TableSchema, TableData, ArrayTable, RecordTable, ArrayTableName, RecordTableName } from "./table/index.js";
import { Metadata } from "./metadata.js";
import { z } from "zod";

export type Schema = {
  [K in keyof Metadata]?: never;
} & {
  [tableName: string]: TableSchema;
};

export type TableName<S extends Schema> = Extract<keyof S, string>;

export type DatabaseData<S extends Schema> = {
  [K in TableName<S>]: TableData<S, K>;
} & Metadata;

export type Migration<S extends Schema> = (data: DatabaseData<S>) => Promise<DatabaseData<S>>;

export type Migrations<S extends Schema> = {
  [key: number]: Migration<S>;
};

export type SunClient<S extends Schema> = {
  [K in TableName<S>]: K extends ArrayTableName<S>
    ? ArrayTable<S, K>
    : K extends RecordTableName<S>
      ? RecordTable<S, K>
      : never;
};

export class SunDB<S extends Schema> {
  private datastore: DataStore<S>;
  client: SunClient<S>;
  constructor(path: string, schema: S) {
    this.datastore = new DataStore(path, schema);
    // Create client
    this.client = this.listTables().reduce((client, tableName) => {
      const tableSchema = schema[tableName];
      if(tableSchema instanceof z.ZodArray) {
        (client[tableName] as ArrayTable<S, ArrayTableName<S>>) = new ArrayTable(this.datastore, tableName as ArrayTableName<S>);
      } else if(tableSchema instanceof z.ZodRecord) {
        (client[tableName] as RecordTable<S, RecordTableName<S>>) = new RecordTable(this.datastore, tableName as RecordTableName<S>);
      }
      return client;
    }, {} as SunClient<S>);
  }
  async migrate(targetVersion: number, migrations: Migrations<S>): Promise<void> {
    const currentVersion = await this.version();
    const validMigrations = Object.keys(migrations).sort().map((key) => ({
      version: parseInt(key),
      migrate: migrations[key]
    })).filter(({ version }) => {
      return version > currentVersion && version <= targetVersion;
    });
    for(let i=0; i<validMigrations.length; i+=1) {
      const { version, migrate } = validMigrations[i];
      await this.datastore.transaction(async () => {
        const databaseData = await this.datastore.read();
        const migrated = await migrate(databaseData);
        // eslint-disable-next-line no-underscore-dangle
        migrated._version = version;
        await this.datastore.write(migrated);
      });
    }
  }
  /**
   * Returns a list of all table names.
   */
  listTables(): TableName<S>[] {
    return this.datastore.listTables();
  }
  /**
   * Drop the entire database.
   */
  drop(): Promise<void> {
    return this.datastore.drop();
  }
  /**
   * Remove the database file.
   */
  erase(): Promise<void> {
    return this.datastore.erase();
  }
  /**
   * Get the current version of the database.
   */
  version(): Promise<number> {
    return this.datastore.version();
  }
}
