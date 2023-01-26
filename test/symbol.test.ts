import { test, expect, describe } from "@jest/globals";
import z from "zod";
import { uuid, serialID } from "../source/symbol.js";

describe("uuid", () => {
  test("no path", () => {
    const data = ["1", "2", "3"];
    const result = uuid(data);
    expect(z.string().uuid().safeParse(result).success).toBe(true);
  });
  test("empty path", () => {
    const data = ["1", "2", "3"];
    const result = uuid(data, []);
    expect(z.string().uuid().safeParse(result).success).toBe(true);
  });
  test("with path", () => {
    const data = [
      { a: "a", b: "b" }
    ];
    const result = uuid(data, ["a"]);
    expect(z.string().uuid().safeParse(result).success).toBe(true);
  });
  test("invalid path", () => {
    const data = ["1", "2", "3"];
    const result = uuid(data, ["x"]);
    expect(z.string().uuid().safeParse(result).success).toBe(true);
  });
});

describe("serialID", () => {
  test("no path", () => {
    const data = ["1", "2", "3"];
    const result = serialID(data);
    expect(result).toBe("4");
  });
  test("empty path", () => {
    const data = ["1", "2", "3"];
    const result = serialID(data, []);
    expect(result).toBe("4");
  });
  test("empty", () => {
    const data = [];
    const result = serialID(data, ["b"]);
    expect(result).toBe("1");
  });
  test("next", () => {
    const data = [
      { a: "a", b: "1" },
      { a: "b", b: "2" },
      { a: "c", b: "3" }
    ];
    const result = serialID(data, ["b"]);
    expect(result).toBe("4");
  });
  test("with gaps", () => {
    const data = [
      { a: "a", b: "1" },
      { a: "b", b: "5" },
      { a: "c", b: "3" }
    ];
    const result = serialID(data, ["b"]);
    expect(result).toBe("6");
  });
  test("non-numeric", () => {
    const data = [
      { a: "a", b: "test" },
      { a: "b", b: "5" },
      { a: "c", b: "3" }
    ];
    const result = serialID(data, ["b"]);
    expect(result).toBe("6");
  });
  test("nested path", () => {
    const data = [
      { a: "a", b: { c: "1" } },
      { a: "b", b: { c: "2" } },
      { a: "c", b: { c: "3" } }
    ];
    const result = serialID(data, ["b", "c"]);
    expect(result).toBe("4");
  });
  test("invalid path", () => {
    const data = [
      { a: "a", b: "1" },
      { a: "b", b: "2" },
      { a: "c", b: "3" }
    ];
    const result = serialID(data, ["x"]);
    expect(result).toBe("1");
  });
});
