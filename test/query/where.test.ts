import { test, expect, describe } from "@jest/globals";
import { compare } from "../../source/query/where.js";

describe("null", () => {
  test("eq", () => {
    expect(compare(null, { eq: null })).toBe(true);
  });
  test("neq", () => {
    expect(compare(null, { neq: null })).toBe(false);
    expect(compare(null, { neq: false })).toBe(true);
  });
});

describe("boolean", () => {
  test("eq", () => {
    expect(compare(true, { eq: true })).toBe(true);
  });
  test("neq", () => {
    expect(compare(true, { neq: true })).toBe(false);
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
    expect(compare(1, { gt: 1 })).toBe(false);
  });
  test("gte", () => {
    expect(compare(1, { gte: 1 })).toBe(true);
    expect(compare(1, { gte: 2 })).toBe(false);
  });
  test("lt", () => {
    expect(compare(1, { lt: 2 })).toBe(true);
    expect(compare(1, { lt: 1 })).toBe(false);
  });
  test("lte", () => {
    expect(compare(1, { lte: 1 })).toBe(true);
    expect(compare(1, { lte: 0 })).toBe(false);
  });
  test("in", () => {
    expect(compare(1, { in: [1, 2] })).toBe(true);
    expect(compare(3, { in: [1, 2] })).toBe(false);
  });
  test("nin", () => {
    expect(compare(1, { nin: [2, 3] })).toBe(true);
    expect(compare(1, { nin: [1, 2] })).toBe(false);
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
    expect(compare("abc", { startsWith: "b" })).toBe(false);
  });
  test("nstartsWith", () => {
    expect(compare("abc", { nstartsWith: "b" })).toBe(true);
    expect(compare("abc", { nstartsWith: "a" })).toBe(false);
  });
  test("endsWith", () => {
    expect(compare("abc", { endsWith: "c" })).toBe(true);
    expect(compare("abc", { endsWith: "a" })).toBe(false);
  });
  test("nendsWith", () => {
    expect(compare("abc", { nendsWith: "b" })).toBe(true);
    expect(compare("abc", { nendsWith: "c" })).toBe(false);
  });
  test("includes", () => {
    expect(compare("abc", { includes: "b" })).toBe(true);
    expect(compare("abc", { includes: "d" })).toBe(false);
  });
  test("nincludes", () => {
    expect(compare("abc", { nincludes: "d" })).toBe(true);
    expect(compare("abc", { nincludes: "c" })).toBe(false);
  });
  test("regex", () => {
    expect(compare("abc", { regex: /a/ })).toBe(true);
    expect(compare("abc", { regex: /d/ })).toBe(false);
  });
  test("nregex", () => {
    expect(compare("abc", { nregex: /d/ })).toBe(true);
    expect(compare("abc", { nregex: /a/ })).toBe(false);
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
  test("undefined field", () => {
    const value = { a: 1, b: undefined } as { a: number; b?: number };
    expect(compare(value, { b: { eq: 1 } })).toBe(false);
    expect(compare(value, { b: { neq: 1 } })).toBe(true);
  });
});

describe("undefined", () => {
  test("eq", () => {
    expect(compare(undefined, { eq: 1 })).toBe(false);
  });
  test("neq", () => {
    expect(compare(undefined, { neq: 1 })).toBe(true);
  });
  test("gt", () => {
    expect(compare(undefined, { gt: 1 })).toBe(false);
  });
  test("in", () => {
    expect(compare(undefined, { in: [1, 2] })).toBe(false);
  });
  test("startsWith", () => {
    expect(compare(undefined as string | undefined, { startsWith: "a" })).toBe(false);
    expect(compare(undefined as string | undefined, { nstartsWith: "a" })).toBe(true);
  });
  test("nstartsWith", () => {
    expect(compare(undefined as string | undefined, { nstartsWith: "a" })).toBe(true);
    expect(compare(undefined as string | undefined, { startsWith: "a" })).toBe(false);
  });
  test("endsWith", () => {
    expect(compare(undefined as string | undefined, { endsWith: "a" })).toBe(false);
    expect(compare(undefined as string | undefined, { nendsWith: "a" })).toBe(true);
  });
  test("nendsWith", () => {
    expect(compare(undefined as string | undefined, { nendsWith: "a" })).toBe(true);
    expect(compare(undefined as string | undefined, { endsWith: "a" })).toBe(false);
  });
  test("includes", () => {
    expect(compare(undefined as string | undefined, { includes: "a" })).toBe(false);
    expect(compare(undefined as string | undefined, { nincludes: "a" })).toBe(true);
  });
  test("nincludes", () => {
    expect(compare(undefined as string | undefined, { nincludes: "a" })).toBe(true);
    expect(compare(undefined as string | undefined, { includes: "a" })).toBe(false);
  });
  test("regex", () => {
    expect(compare(undefined as string | undefined, { regex: /a/ })).toBe(false);
    expect(compare(undefined as string | undefined, { nregex: /a/ })).toBe(true);
  });
  test("nregex", () => {
    expect(compare(undefined as string | undefined, { nregex: /a/ })).toBe(true);
    expect(compare(undefined as string | undefined, { regex: /a/ })).toBe(false);
  });
  test("contains", () => {
    expect(compare(undefined as number[] | undefined, { contains: { eq: 1 } })).toBe(false);
  });
  test("ncontains", () => {
    expect(compare(undefined as number[] | undefined, { ncontains: { eq: 1 } })).toBe(true);
  });
});
