import { Datastore, DatastoreOptions } from "./datastore.js";
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

/**
 * A migration function.
 * If data is returned, it will be written to the database.
 */
export type Migration<S extends Schema> = (db: SunDB<S>) => Promise<DatabaseData<S> | void>;

export type Migrations<S extends Schema> = {
  [key: number]: Migration<S>;
};

export type SunDBClient<S extends Schema> = {
  [K in TableName<S>]: K extends ArrayTableName<S>
    ? ArrayTable<S, K>
    : K extends RecordTableName<S>
      ? RecordTable<S, K>
      : never;
};

export type SunDBOptions = DatastoreOptions;

export class SunDB<S extends Schema> {
  private datastore: Datastore<S>;
  client: SunDBClient<S>;
  constructor(path: string, schema: S, options: SunDBOptions = {}) {
    this.datastore = new Datastore(path, schema, options);
    // Create client
    this.client = this.tables().reduce((client, tableName) => {
      const tableSchema = schema[tableName];
      if(tableSchema instanceof z.ZodArray) {
        (client[tableName] as ArrayTable<S, ArrayTableName<S>>) = new ArrayTable(this.datastore, tableName as ArrayTableName<S>);
      } else if(tableSchema instanceof z.ZodRecord) {
        (client[tableName] as RecordTable<S, RecordTableName<S>>) = new RecordTable(this.datastore, tableName as RecordTableName<S>);
      }
      return client;
    }, {} as SunDBClient<S>);
  }
  /**
   * Get the path to the database file.
   */
  path(): string {
    return this.datastore.path;
  }
  /**
   * Move the database file to a new path.
   */
  // async move(path: string): Promise<void> {
  //   await this.datastore.move(path);
  // }
  /**
   * Get the schema of the database.
   */
  schema(): S {
    return this.datastore.schema;
  }
  /**
   * Returns an array of all table names.
   */
  tables(): TableName<S>[] {
    return this.datastore.tables();
  }
  /**
   * Return all data in the database.
   */
  read(): Promise<DatabaseData<S>> {
    return this.datastore.read();
  }
  /**
   * Return all data in the database.
   */
  write(data: DatabaseData<S>): Promise<void> {
    return this.datastore.transaction(async () => {
      await this.datastore.write(data);
    });
  }
  /**
   * Flush the cache.
   */
  flush(): void {
    return this.datastore.flush();
  }
  /**
   * Drop the entire database.
   */
  drop(): Promise<void> {
    return this.datastore.drop();
  }
  /**
   * Completely remove the database file.
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
  /**
   * Migrate the database to a target version.
   * All migrations higher than the current database version are run in order, until the target version is reached.
   */
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
}
