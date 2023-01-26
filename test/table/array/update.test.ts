import { test, expect, beforeEach, afterEach } from "@jest/globals";
import z from "zod";
import { schema, setup, restore, data } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("update", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.posts.update({
    where: {
      title: {
        eq: "Hello World"
      }
    },
    data: {
      title: "Hello Worlds"
    }
  });
  const posts = await client.posts.select();
  expect(posts).toEqual([{ ...data.posts[0], title: "Hello Worlds" }, data.posts[1]]);
});

test("update value", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.items.update({
    where: {
      eq: "a"
    },
    data: "A"
  });
  const items = await client.items.select();
  expect(items).toEqual(["A", "b", "c", null]);
});

test("update now", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.posts.update({
    where: {
      title: {
        eq: "Hello World"
      }
    },
    data: {
      content: client.posts.now
    }
  });
  const posts = await client.posts.select();
  expect(z.string().datetime().safeParse(posts[0].content).success).toBe(true);
});

