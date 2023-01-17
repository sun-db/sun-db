import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../setup.js";
import { SunDB } from "../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("set", async () => {
  const { client } = new SunDB("./data.json", schema);
  const newUser = {
    name: "New User",
    age: 22
  };
  await client.users.set("3", newUser);
  const user = await client.users.get("3");
  expect(user).toEqual(newUser);
});
