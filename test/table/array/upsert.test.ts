import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore, data } from "../setup.js";
import { SunDB } from "../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("upsert", async () => {
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

test("upsert serialID", async () => {
  const { client } = new SunDB("./data.json", schema);
  const post = {
    id: client.posts.serialID,
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
  expect(posts).toEqual([...data.posts, { ...post, id: "3" }]);
});
