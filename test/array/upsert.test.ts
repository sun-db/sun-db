import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore, db } from "../setup.js";
import { SunDB } from "../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("upsert", async () => {
  const { client } = new SunDB("./data.json", schema);
  await client.posts.upsert({
    where: {
      title: {
        eq: "Does not exist"
      }
    }
  }, {
    title: "New Title",
    content: "New Content"
  });
  const posts = await client.posts.select();
  expect(posts).toEqual([...db.posts, {
    title: "New Title",
    content: "New Content"
  }]);
});
