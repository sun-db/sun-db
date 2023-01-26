import { test, expect, describe } from "@jest/globals";
import { find, filter, map } from "../../source/query/index.js";

describe("find", () => {
  const array = [
    { id: 1, name: "a" },
    { id: 2, name: "b" },
    { id: 3, name: "c" }
  ];
  test("first", () => {
    expect(find<any, "test">(array)).toEqual({ id: 1, name: "a" });
  });
  test("match", () => {
    expect(find<any, "test">(array, { where: { id: { eq: 2 } } })).toEqual({ id: 2, name: "b" });
  });
  test("no match", () => {
    expect(find<any, "test">(array, { where: { id: { eq: 4 } } })).toEqual(undefined);
  });
});

describe("filter", () => {
  const array = [
    { id: 1, name: "a" },
    { id: 2, name: "b" },
    { id: 3, name: "c" }
  ];
  test("match", () => {
    expect(filter<any, "test">(array, { where: { id: { eq: 2 } } })).toEqual([{ id: 2, name: "b" }]);
  });
  test("no match", () => {
    expect(filter<any, "test">(array, { where: { id: { eq: 4 } } })).toEqual([]);
  });
  test("limit", () => {
    expect(filter<any, "test">(array, { limit: 1 })).toEqual([{ id: 1, name: "a" }]);
  });
  test("limit too long", () => {
    expect(filter<any, "test">(array, { limit: 10 })).toEqual(array);
  });
  test("offset", () => {
    expect(filter<any, "test">(array, { offset: 1 })).toEqual([{ id: 2, name: "b" }, { id: 3, name: "c" }]);
  });
  test("limit + offset", () => {
    expect(filter<any, "test">(array, { offset: 1, limit: 1 })).toEqual([{ id: 2, name: "b" }]);
  });
});

describe("map", () => {
  const array = [
    { id: 1, name: "a" },
    { id: 2, name: "b" },
    { id: 3, name: "c" }
  ];
  test("match", () => {
    const result1 = map<any, "test">(
      array,
      { where: { id: { eq: 2 } } },
      (item) => ({ test: item.name })
    );
    expect(result1).toEqual([{ id: 1, name: "a" }, { test: "b" }, { id: 3, name: "c" }]);
  });
  test("no match", () => {
    const result2 = map<any, "test">(
      array,
      { where: { id: { eq: 4 } } },
      (item) => ({ test: item.name })
    );
    expect(result2).toEqual(array);
  });
  test("limit", () => {
    const result1 = map<any, "test">(
      array,
      { where: { id: { in: [1, 2, 3] } }, limit: 1 },
      (item) => ({ test: item.name })
    );
    expect(result1).toEqual([{ test: "a" }, { id: 2, name: "b" }, { id: 3, name: "c" }]);
  });
  test("limit + offset", () => {
    const result1 = map<any, "test">(
      array,
      { where: { id: { in: [1, 2, 3] } }, limit: 1, offset: 1 },
      (item) => ({ test: item.name })
    );
    expect(result1).toEqual([{ id: 1, name: "a" }, { test: "b" }, { id: 3, name: "c" }]);
  });
});
