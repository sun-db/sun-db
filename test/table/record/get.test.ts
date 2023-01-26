import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { data, schema, setup, restore } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("get", async () => {
  const { client } = new SunDB("./data.json", schema);
  const user = await client.users.get("1");
  expect(user).toEqual(data.users["1"]);
});
