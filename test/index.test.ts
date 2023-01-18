import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "./setup.js";
import { SunDB } from "../source/index.js";

beforeEach(setup);
afterEach(restore);

test("listTables", async () => {
  const db = new SunDB("./data.json", schema);
  expect(db.listTables()).toEqual(["users", "posts"]);
});

test("race condition", async () => {
  const { client } = new SunDB("./data.json", schema);
  await Promise.all([
    client.users.set("1", {
      name: "New Username",
      age: 20
    }),
    client.users.set("2", {
      name: "New Username",
      age: 21
    })
  ]);
  const user = await client.users.get("1");
  expect(user).toEqual({
    name: "New Username",
    age: 20
  });
});
