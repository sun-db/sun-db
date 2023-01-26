import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("has", async () => {
  const { client } = new SunDB("./data.json", schema);
  const has = await client.users.has("1");
  expect(has).toBe(true);
});
