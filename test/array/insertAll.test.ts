import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../setup.js";
import { SunDB } from "../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("insertAll", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = [{
    title: "Hello World",
    content: "Hello World"
  }];
  await client.posts.insertAll(data);
  const posts = await client.posts.select();
  expect(posts[posts.length-1]).toEqual(data[0]);
});
