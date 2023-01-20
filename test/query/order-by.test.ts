import { test, expect } from "@jest/globals";
import { sort } from "../../source/query/order-by.js";
import { schema, db } from "../setup.js";

test("asc", () => {
  const result = sort<typeof schema, "posts">(db.posts, { orderBy: "id_asc" });
  expect(result).toEqual(db.posts);
});

test("desc", () => {
  const result = sort<typeof schema, "posts">(db.posts, { orderBy: "id_desc" });
  expect(result).toEqual([db.posts[1], db.posts[0]]);
});

test("asc_nullish_first", () => {
  const result = sort<typeof schema, "posts">(db.posts, { orderBy: "content_asc_nullish_first" });
  expect(result).toEqual([db.posts[1], db.posts[0]]);
});

test("asc_nullish_last", () => {
  const result = sort<typeof schema, "posts">(db.posts, { orderBy: "content_asc_nullish_last" });
  expect(result).toEqual([db.posts[0], db.posts[1]]);
});

test("desc_nullish_first", () => {
  const result = sort<typeof schema, "posts">(db.posts, { orderBy: "content_desc_nullish_first" });
  expect(result).toEqual([db.posts[1], db.posts[0]]);
});

test("desc_nullish_last", () => {
  const result = sort<typeof schema, "posts">(db.posts, { orderBy: "content_desc_nullish_last" });
  expect(result).toEqual([db.posts[0], db.posts[1]]);
});
