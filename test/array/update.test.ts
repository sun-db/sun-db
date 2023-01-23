import { test, expect, beforeEach, afterEach } from "@jest/globals";
import z from "zod";
import { schema, setup, restore, db } from "../setup.js";
import { SunDB } from "../../source/index.js";

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
  expect(posts).toEqual([{ ...db.posts[0], title: "Hello Worlds" }, db.posts[1]]);
});

test("update", async () => {
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

