import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore, data } from "../../setup.js";
import { SunDB } from "../../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("select first empty", async () => {
  const { client } = new SunDB("./data.json", schema);
  const posts = await client.posts.selectFirst();
  expect(posts).toEqual(data.posts[0]);
});

test("select first", async () => {
  const { client } = new SunDB("./data.json", schema);
  const posts = await client.posts.selectFirst({
    where: {
      title: {
        neq: "Does not exist"
      }
    }
  });
  expect(posts).toEqual(data.posts[0]);
});

test("select first none", async () => {
  const { client } = new SunDB("./data.json", schema);
  const posts = await client.posts.selectFirst({
    where: {
      title: {
        eq: "Does not exist"
      }
    }
  });
  expect(posts).toEqual(undefined);
});
