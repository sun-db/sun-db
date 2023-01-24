import { Datastore, Schema, TableName } from "../datastore/index.js";
import { symbols } from "../symbol.js";

export class Table<S extends Schema, N extends TableName<S>> {
  protected datastore: Datastore<S>;
  name: N;
  // Symbols
  uuid = symbols.uuid();
  serialID = symbols.serialID();
  now = symbols.now();
  constructor(datastore: Datastore<S>, name: N) {
    this.datastore = datastore;
    this.name = name;
  }
  schema(): S[N] {
    return this.datastore.schema[this.name];
  }
  /**
   * Rename the table.
   */
  async rename(name: string) {
    return this.datastore.transaction(async () => {
      const databaseData = await this.datastore.read();
      databaseData[name as N] = databaseData[this.name];
      delete databaseData[this.name];
      await this.datastore.write(databaseData);
      this.name = name as N;
    });
  }
  /**
   * Drop the table entirely.
   */
  async drop() {
    return this.datastore.transaction(async () => {
      const databaseData = await this.datastore.read();
      delete databaseData[this.name];
      return this.datastore.write(databaseData);
    });
  }
}
