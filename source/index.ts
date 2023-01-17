import z from "zod";
import { JSONValue } from "types-json";
import { DataStore } from "./datastore.js";
import { Table } from "./table.js";

type TableSchema = {
  [key: string]: z.ZodSchema<JSONValue>;
};

export type Schema = {
  [key: string]: TableSchema;
} & {
  _version?: never;
};

export type TableName<S extends Schema> = keyof S & string;

export type TableRecord<T extends TableSchema> = {
  [F in keyof T]: T[F]["_type"];
};

export type TableData<T extends TableSchema> = {
  [key: string]: TableRecord<T>;
};

export type Metadata = {
  _version: number;
};

export type DatabaseData<S extends Schema> = {
  [K in TableName<S>]: TableData<S[K]>;
} & Metadata;

export type SunClient<S extends Schema> = {
  [K in TableName<S>]: Table<S, K>;
};

export type Migration<S extends Schema> = (data: DatabaseData<S>) => Promise<DatabaseData<S>>;

export type Migrations<S extends Schema> = {
  [key: number]: Migration<S>;
};

export class SunDB<S extends Schema> {
  private datastore: DataStore<S>;
  client: SunClient<S>;
  constructor(path: string, schema: S) {
    this.datastore = new DataStore(path, schema);
    // Create client
    this.initClient();
  }
  private initClient() {
    this.client = this.listTables().reduce((client, tableName) => {
      client[tableName] = new Table(this.datastore, tableName);
      return client;
    }, {} as SunClient<S>);
  }
  async migrate(targetVersion: number, migrations: Migrations<S>): Promise<void> {
    const currentVersion = await this.datastore.version();
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
  remove(): Promise<void> {
    return this.datastore.remove();
  }
}
