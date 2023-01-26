import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { writeJSON } from "write-json-safe";
import { setup, restore, schema } from "../setup.js";
import { Datastore } from "../../source/datastore/index.js";

beforeEach(setup);
afterEach(restore);

test("tables", () => {
  const db = new Datastore("./data.json", schema);
  expect(db.tables()).toEqual(["users", "posts", "items"]);
});

test("read invalid data", async () => {
  const db = new Datastore("./data.json", schema);
  await writeJSON("./data.json", { users: "invalid" });
  expect(await db.read()).toEqual({
    users: {},
    posts: [],
    items: []
  });
});

test("write failure", async () => {
  const db = new Datastore("/no-access/data.json", schema);
  await expect(db.write({})).rejects.toThrow();
});
