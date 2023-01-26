import { test, expect, beforeEach, afterEach } from "@jest/globals";
import z from "zod";
import { schema, setup, restore } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("add", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    name: "New User",
    age: 22
  };
  const user = await client.users.add("3", data);
  expect(user).toEqual(["3", data]);
});

test("add undefined age", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    name: "New User",
    age: undefined
  };
  const user = await client.users.add("3", data);
  expect(user).toEqual(["3", data]);
});

test("add no age", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    name: "New User"
  };
  const user = await client.users.add("3", data);
  expect(user).toEqual(["3", data]);
});

test("already exists", async () => {
  const { client } = new SunDB("./data.json", schema);
  const user = await client.users.add("1", {
    name: "New User",
    age: 22
  });
  expect(user).toBeUndefined();
});

test("add uuid", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    name: "New User",
    age: 22
  };
  const user = await client.users.add(client.users.uuid, data);
  expect(z.string().uuid().safeParse(user?.[0]).success).toBe(true);
});

test("add serialID", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    name: "New User",
    age: 22
  };
  const user = await client.users.add(client.users.serialID, data);
  expect(user?.[0]).toBe("3");
});

test("add now", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    name: "New User",
    age: 22
  };
  const user = await client.users.add(client.users.now, data);
  expect(z.string().datetime().safeParse(user?.[0]).success).toBe(true);
});

test("add invalid symbol", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    name: "New User",
    age: 22
  };
  let error: Error | undefined;
  try {
    await client.users.add(Symbol("invalid"), data);
  } catch(e) {
    error = e;
  }
  expect(error).toEqual(new Error("Invalid Symbol"));
});
