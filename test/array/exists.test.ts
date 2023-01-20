import { test, expect, beforeEach, afterEach } from "@jest/globals";
import { schema, setup, restore } from "../setup.js";
import { SunDB } from "../../source/index.js";

beforeEach(setup);
afterEach(restore);

test("exists", async () => {
  const { client } = new SunDB("./data.json", schema);
  const exists = await client.posts.exists({
    where: {
      title: {
        eq: "Hello World"
      }
    }
  });
  expect(exists).toEqual(true);
});

test("not exists", async () => {
  const { client } = new SunDB("./data.json", schema);
  const exists = await client.posts.exists({
    where: {
      title: {
        eq: "Does not exist"
      }
    }
  });
  expect(exists).toEqual(false);
});
