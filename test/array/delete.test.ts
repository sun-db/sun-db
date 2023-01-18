import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../setup.js";

beforeEach(setup);
afterEach(restore);

import { SunDB } from "../../source/index.js";

test("delete", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.posts.delete({
    where: {
      title: {
        eq: "Hello World"
      }
    }
  });
  const posts = await client.posts.select();
  expect(posts).toEqual([]);
});
