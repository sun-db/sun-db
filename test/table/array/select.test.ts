import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore, data } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("select empty", async () => {
  const { client } = new SunDB("./data.json", schema);
  const posts = await client.posts.select();
  expect(posts).toEqual(data.posts);
});

test("select eq", async () => {
  const { client } = new SunDB("./data.json", schema);
  const posts = await client.posts.select({
    where: {
      title: {
        eq: "Hello World"
      }
    }
  });
  expect(posts).toEqual([data.posts[0]]);
});

test("select none", async () => {
  const { client } = new SunDB("./data.json", schema);
  const posts = await client.posts.select({
    where: {
      title: {
        eq: "Hello Worlds"
      }
    }
  });
  expect(posts).toEqual([]);
});
