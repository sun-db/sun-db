import { test, expect, beforeEach, afterEach } from "@jest/globals";
import z from "zod";
import { schema, setup, restore } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("insert", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    id: 3,
    title: "Hello World 2",
    content: "Hello World 2"
  };
  await client.posts.insert(data);
  const posts = await client.posts.select();
  expect(posts[posts.length-1]).toEqual(data);
});

test("insert uuid", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    id: 3,
    title: "Hello World 2",
    content: client.posts.uuid
  };
  await client.posts.insert(data);
  const posts = await client.posts.select();
  const content = posts[posts.length-1].content;
  expect(z.string().uuid().safeParse(content).success).toBe(true);
});

test("insert now", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    id: 3,
    title: "Hello World 2",
    content: client.posts.now
  };
  await client.posts.insert(data);
  const posts = await client.posts.select();
  const content = posts[posts.length-1].content;
  expect(z.string().datetime().safeParse(content).success).toBe(true);
});

test("insert serialID", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    id: client.posts.serialID,
    title: "Hello World 2",
    content: "Serial ID Test"
  };
  await client.posts.insert(data);
  const posts = await client.posts.select();
  const id = posts[posts.length-1].id;
  expect(id).toBe("3");
});

test("insert invalid symbol", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = {
    id: Symbol("invalid"),
    title: "Hello World 2",
    content: "Serial ID Test"
  };
  let error: Error | undefined;
  try {
    await client.posts.insert(data);
  } catch(e) {
    error = e;
  }
  expect(error).toEqual(new Error("Invalid Symbol"));
});
