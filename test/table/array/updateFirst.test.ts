import { test, expect, beforeEach, afterEach } from "@jest/globals";
import z from "zod";
import { schema, setup, restore, data } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("update first", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.posts.updateFirst({
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

test("update first now", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.posts.updateFirst({
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

