import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("replace match", async () => {
  const { client } = new SunDB("./data.json", schema);
  const newUser = {
    name: "New User",
    age: 22
  };
  const user = await client.users.replace("2", newUser);
  expect(user).toEqual(newUser);
});

test("replace no match", async () => {
  const { client } = new SunDB("./data.json", schema);
  const newUser = {
    name: "New User",
    age: 22
  };
  const user = await client.users.replace("3", newUser);
  expect(user).toEqual(undefined);
});
