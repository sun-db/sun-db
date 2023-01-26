import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("drop", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.users.drop();
  const user = await client.users.get("1");
  expect(user).toEqual(undefined);
});
