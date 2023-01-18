import { test, expect, describe } from "@jest/globals";
import { compare } from "../../source/query/where.js";

describe("null", () => {
  test("eq", () => {
    expect(compare(null, { eq: null })).toBe(true);
  });
  test("neq", () => {
    expect(compare(null, { neq: false })).toBe(true);
  });
});

describe("boolean", () => {
  test("eq", () => {
    expect(compare(true, { eq: true })).toBe(true);
  });
  test("neq", () => {
    expect(compare(true, { neq: false })).toBe(true);
  });
  test("in", () => {
    expect(compare(true, { in: [false, true] })).toBe(true);
  });
  test("nin", () => {
    expect(compare(true, { nin: [false] })).toBe(true);
  });
});

describe("number", () => {
  test("undefined", () => {
    expect(compare(1)).toBe(true);
  });
  test("eq", () => {
    expect(compare(1, { eq: 1 })).toBe(true);
  });
  test("neq", () => {
    expect(compare(1, { neq: 2 })).toBe(true);
  });
  test("gt", () => {
    expect(compare(1, { gt: 0 })).toBe(true);
  });
  test("gte", () => {
    expect(compare(1, { gte: 1 })).toBe(true);
  });
  test("lt", () => {
    expect(compare(1, { lt: 2 })).toBe(true);
  });
  test("lte", () => {
    expect(compare(1, { lte: 1 })).toBe(true);
  });
  test("in", () => {
    expect(compare(1, { in: [1, 2] })).toBe(true);
  });
  test("nin", () => {
    expect(compare(1, { nin: [2, 3] })).toBe(true);
  });
});

describe("string", () => {
  test("eq", () => {
    expect(compare("a", { eq: "a" })).toBe(true);
  });
  test("neq", () => {
    expect(compare("a", { neq: "A" })).toBe(true);
  });
  test("gt", () => {
    expect(compare("b", { gt: "a" })).toBe(true);
  });
  test("gte", () => {
    expect(compare("a", { gte: "a" })).toBe(true);
  });
  test("lt", () => {
    expect(compare("a", { lt: "b" })).toBe(true);
  });
  test("lte", () => {
    expect(compare("a", { lte: "a" })).toBe(true);
  });
  test("in", () => {
    expect(compare("a", { in: ["a", "b"] })).toBe(true);
  });
  test("nin", () => {
    expect(compare("a", { nin: ["b", "c"] })).toBe(true);
  });
  test("startsWith", () => {
    expect(compare("abc", { startsWith: "a" })).toBe(true);
  });
  test("nstartsWith", () => {
    expect(compare("abc", { nstartsWith: "b" })).toBe(true);
  });
  test("endsWith", () => {
    expect(compare("abc", { endsWith: "c" })).toBe(true);
  });
  test("nendsWith", () => {
    expect(compare("abc", { nendsWith: "b" })).toBe(true);
  });
  test("includes", () => {
    expect(compare("abc", { includes: "b" })).toBe(true);
  });
  test("nincludes", () => {
    expect(compare("abc", { nincludes: "d" })).toBe(true);
  });
  test("regex", () => {
    expect(compare("abc", { regex: /a/ })).toBe(true);
  });
  test("nregex", () => {
    expect(compare("abc", { nregex: /d/ })).toBe(true);
  });
});

describe("array", () => {
  test("contains", () => {
    expect(compare([1, 2], { contains: { eq: 1 } })).toBe(true);
  });
  test("ncontains", () => {
    expect(compare([1, 2], { ncontains: { eq: 3 } })).toBe(true);
  });
});

describe("object", () => {
  test("eq", () => {
    expect(compare({ a: 1 }, { a: { eq: 1 } })).toBe(true);
  });
});
