import { test, expect, beforeEach, afterEach } from "@jest/globals";
import z from "zod";
import { schema, setup, restore } from "../setup.js";
import { SunDB } from "../../source/index.js";

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
