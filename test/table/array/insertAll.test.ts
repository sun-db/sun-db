import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../setup.js";
import { SunDB } from "../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("insertAll", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = [{
    id: 3,
    title: "Hello World 2",
    content: "Hello World 2"
  }];
  await client.posts.insertAll(data);
  const posts = await client.posts.select();
  expect(posts[posts.length-1]).toEqual(data[0]);
});

test("insertAll serialID", async () => {
  const { client } = new SunDB("./data.json", schema);
  const data = [{
    id: client.posts.serialID,
    title: "Hello World 2",
    content: "Hello World 2"
  }];
  await client.posts.insertAll(data);
  const posts = await client.posts.select();
  expect(posts[posts.length-1].id).toEqual("3");
});
