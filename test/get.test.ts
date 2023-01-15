import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { db, schema, setup, restore } from "./setup.js";
import { SunDB } from "../source/index.js";

beforeEach(setup);
afterEach(restore);

test("get", async () => {
  const { client } = new SunDB("./data.json", schema);
  const user = await client.users.get("1");
  expect(user).toEqual(db.users["1"]);
});

test("get number", async () => {
  const { client } = new SunDB("./data.json", schema);
  const user = await client.users.get(1);
  expect(user).toEqual(db.users["1"]);
});
