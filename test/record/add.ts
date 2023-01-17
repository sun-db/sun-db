import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../setup.js";
import { SunDB } from "../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("add", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    name: "New User",
    age: 22
  };
  const user = await client.users.add("3", data);
  expect(user).toEqual(data);
});

test("already exists", async () => {
  const { client } = new SunDB("./data.json", schema);
  const user = await client.users.add("1", {
    name: "New User",
    age: 22
  });
  expect(user).toBeUndefined();
});
