import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore, data } from "../../setup.js";

beforeEach(setup);
afterEach(restore);

import { SunDB } from "../../../source/index.js";

test("delete first", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.posts.deleteFirst({
    where: {
      title: {
        eq: "Hello World"
      }
    }
  });
  const posts = await client.posts.select();
  expect(posts).toEqual([data.posts[1]]);
});
