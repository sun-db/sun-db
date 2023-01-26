import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../setup.js";
import { Datastore } from "../../source/datastore/index.js";
import { Table } from "../../source/table/table.js";

beforeEach(setup);
afterEach(restore);

test("schema", async () => {
  const datastore = new Datastore("./data.json", schema);
  const table = new Table(datastore, "posts");
  expect(table.schema()).toEqual(schema.posts);
});

test("rename", async () => {
  const datastore = new Datastore("./data.json", schema);
  const table = new Table(datastore, "posts");
  await table.rename("posts2");
  expect(table.name).toBe("posts2");
});

test("drop", async () => {
  const datastore = new Datastore("./data.json", schema);
  const table = new Table(datastore, "posts");
  await table.drop();
  const data = await datastore.read();
  expect(data.posts).toBe(undefined);
});
