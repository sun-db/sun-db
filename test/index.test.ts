import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { fileExists } from "file-exists-safe";
import { writeJSON } from "write-json-safe";
import { data, schema, setup, restore } from "./setup.js";
import { SunDB } from "../source/index.js";

beforeEach(setup);
afterEach(restore);

test("path", () => {
  const db = new SunDB("./data.json", schema);
  expect(db.path()).toEqual("./data.json");
});

test("schema", () => {
  const db = new SunDB("./data.json", schema);
  expect(db.schema()).toEqual(schema);
});

test("tables", async () => {
  const db = new SunDB("./data.json", schema);
  expect(db.tables()).toEqual(["users", "posts"]);
});

test("read", async () => {
  const db = new SunDB("./data.json", schema);
  expect(await db.read()).toEqual(data);
});

test("write", async () => {
  const db = new SunDB("./data.json", schema);
  await db.write({});
  expect(await db.read()).toEqual({});
});

test("drop", async () => {
  const db = new SunDB("./data.json", schema);
  await db.drop();
  expect(await db.read()).toEqual({});
});

test("flush", async () => {
  const db = new SunDB("./data.json", schema);
  expect(await db.read()).not.toEqual({});
  await writeJSON("./data.json", {});
  expect(await db.read()).not.toEqual({});
  db.flush();
  expect(await db.read()).toEqual({});
});

test("erase", async () => {
  const db = new SunDB("./data.json", schema);
  await db.erase();
  await expect(fileExists("./data.json")).resolves.toBe(false);
});

test("version", async () => {
  const db = new SunDB("./data.json", schema);
  expect(await db.version()).toEqual(0);
});

test("migrate", async () => {
  const db = new SunDB("./data.json", schema);
  await db.migrate(2, {
    1: async () => {
      return { posts: [{ id: 1, title: "Post 1", content: null }] };
    },
    2: async () => {
      return { posts: [{ id: 2, title: "Post 2", content: null }] };
    },
    3: async () => {
      return { posts: [{ id: 3, title: "Post 3", content: null }] };
    }
  });
  expect(await db.version()).toEqual(2);
  expect(await db.client.posts.select()).toEqual([{ id: 2, title: "Post 2", content: null }]);
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
