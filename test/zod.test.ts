import { test, expect, describe } from "@jest/globals";
import z from "zod";
import { arrayTable, recordTable } from "../source/index.js";

describe("arrayTable", () => {
  test("zod schema", () => {
    const schema = arrayTable(z.number());
    expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
  });
  test("not a schema", () => {
    const schema = arrayTable({
      a: z.string(),
      b: z.number()
    });
    expect(schema.parse([{ a: "a", b: 1 }])).toEqual([{ a: "a", b: 1 }]);
  });
});

describe("recordTable", () => {
  test("zod schema", () => {
    const schema = recordTable(z.number());
    expect(schema.parse({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
  });
  test("not a schema", () => {
    const schema = recordTable({
      a: z.string(),
      b: z.number()
    });
    expect(schema.parse({ a: { a: "a", b: 1 } })).toEqual({ a: { a: "a", b: 1 } });
  });
});
