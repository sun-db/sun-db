import { test, expect } from "@jest/globals";
import { sort } from "../../source/query/order-by.js";
import { schema, data } from "../setup.js";

const reversed = [...data.posts].reverse();
const identical = [data.posts[0], data.posts[0]];

test("asc", () => {
  const result = sort<typeof schema, "posts">(data.posts, { orderBy: "id_asc" });
  expect(result).toEqual(data.posts);
});

test("asc reversed", () => {
  const result = sort<typeof schema, "posts">(reversed, { orderBy: "id_asc" });
  expect(result).toEqual(data.posts);
});

test("asc identical", () => {
  const result = sort<typeof schema, "posts">(identical, { orderBy: "id_asc" });
  expect(result).toEqual(identical);
});

test("desc", () => {
  const result = sort<typeof schema, "posts">(data.posts, { orderBy: "id_desc" });
  expect(result).toEqual(reversed);
});

test("desc reversed", () => {
  const result = sort<typeof schema, "posts">(reversed, { orderBy: "id_desc" });
  expect(result).toEqual(reversed);
});

test("desc identical", () => {
  const result = sort<typeof schema, "posts">(identical, { orderBy: "id_desc" });
  expect(result).toEqual(identical);
});

test("asc_nullish_first", () => {
  const result = sort<typeof schema, "posts">(data.posts, { orderBy: "content_asc_nullish_first" });
  expect(result).toEqual(reversed);
});

test("asc_nullish_first reversed", () => {
  const result = sort<typeof schema, "posts">(reversed, { orderBy: "content_asc_nullish_first" });
  expect(result).toEqual(reversed);
});

test("asc_nullish_last", () => {
  const result = sort<typeof schema, "posts">(data.posts, { orderBy: "content_asc_nullish_last" });
  expect(result).toEqual(data.posts);
});

test("asc_nullish_last reverse", () => {
  const result = sort<typeof schema, "posts">(reversed, { orderBy: "content_asc_nullish_last" });
  expect(result).toEqual(data.posts);
});

test("desc_nullish_first", () => {
  const result = sort<typeof schema, "posts">(data.posts, { orderBy: "content_desc_nullish_first" });
  expect(result).toEqual(reversed);
});

test("desc_nullish_first reverse", () => {
  const result = sort<typeof schema, "posts">(reversed, { orderBy: "content_desc_nullish_first" });
  expect(result).toEqual(reversed);
});

test("desc_nullish_last", () => {
  const result = sort<typeof schema, "posts">(data.posts, { orderBy: "content_desc_nullish_last" });
  expect(result).toEqual(data.posts);
});

test("desc_nullish_last reverse", () => {
  const result = sort<typeof schema, "posts">(reversed, { orderBy: "content_desc_nullish_last" });
  expect(result).toEqual(data.posts);
});

test("asc multiple", () => {
  const multiple = [{
    id: 1,
    title: "A",
    content: null
  }, {
    id: 2,
    title: "A",
    content: null
  }, {
    id: 3,
    title: "B",
    content: null
  }];
  const result = sort<typeof schema, "posts">(multiple, { orderBy: ["title_desc", "id_asc"] });
  expect(result).toEqual([
    multiple[2],
    multiple[0],
    multiple[1]
  ]);
});
