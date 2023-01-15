import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "./setup.js";
import { JSONDatabase } from "../source/index.js";

beforeEach(setup);
afterEach(restore);

test("select", async () => {
  const { client } = new JSONDatabase("./data.json", schema);
  const users = await client.users.select();
  expect(users).toEqual(users);
});
