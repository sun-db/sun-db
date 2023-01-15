import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "./setup.js";
import { JSONDatabase } from "../source/index.js";

beforeEach(setup);
afterEach(restore);

test("delete", async () => {
  const { client } = new JSONDatabase("./data.json", schema);
  await client.users.delete("1");
  const user = await client.users.get("1");
  expect(user).toBe(undefined);
});
