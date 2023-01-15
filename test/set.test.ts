import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "./setup.js";
import { JSONDatabase } from "../source/index.js";

beforeEach(setup);
afterEach(restore);

test("set", async () => {
  const { client } = new JSONDatabase("./data.json", schema);
  const newUser = {
    id: 3,
    name: "New User",
    age: 22
  };
  await client.users.set("3", newUser);
  const user = await client.users.get("3");
  expect(user).toEqual(newUser);
});
