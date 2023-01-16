import z from "zod";
import mock, { restore } from "mock-fs";

export const db = {
  users: {
    1: {
      id: 1,
      name: "John",
      age: 20
    },
    2: {
      id: 2,
      name: "Jane",
      age: 21
    }
  }
};

export function setup() {
  mock({
    "data.json": JSON.stringify(db)
  });
}

export {
  restore
};

export const schema = {
  users: {
    id: z.number().int().positive(),
    name: z.string(),
    age: z.number().int().positive()
  }
};

