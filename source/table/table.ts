import { Schema, TableName } from "../index.js";
import { DataStore } from "../datastore.js";

export class Table<S extends Schema, K extends TableName<S>> {
  protected datastore: DataStore<S>;
  name: K;
  constructor(datastore: DataStore<S>, name: K) {
    this.datastore = datastore;
    this.name = name;
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
