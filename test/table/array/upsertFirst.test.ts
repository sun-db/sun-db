import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore, data } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("upsert first match", async () => {
  const { client } = new SunDB("./data.json", schema);
  const post = {
    id: 3,
    title: "New Title",
    content: "New Content"
  };
  await client.posts.upsertFirst({
    where: {
      title: {
        eq: "Hello World"
      }
    },
    data: post
  });
  const posts = await client.posts.select();
  expect(posts).toEqual([post, data.posts[1]]);
});

test("upsertFirst value", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.items.upsertFirst({
    where: {
      neq: null
    },
    data: "A"
  });
  const items = await client.items.select();
  expect(items).toEqual(["A", "b", "c", null]);
});

test("upsert first no match", async () => {
  const { client } = new SunDB("./data.json", schema);
  const post = {
    id: 3,
    title: "New Title",
    content: "New Content"
  };
  await client.posts.upsert({
    where: {
      title: {
        eq: "Does not exist"
      }
    },
    data: post
  });
  const posts = await client.posts.select();
  expect(posts).toEqual([...data.posts, post]);
});

test("upsert first serialID", async () => {
  const { client } = new SunDB("./data.json", schema);
  const post = {
    id: client.posts.serialID,
    title: "New Title",
    content: "New Content"
  };
  await client.posts.upsertFirst({
    where: {
      title: {
        eq: "Does not exist"
      }
    },
    data: post
  });
  const posts = await client.posts.select();
  expect(posts).toEqual([...data.posts, { ...post, id: "3" }]);
});
