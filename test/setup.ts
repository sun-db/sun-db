import z from "zod";
import mock, { restore } from "mock-fs";

export const db = {
  users: {
    1: {
      name: "John",
      age: 20
    },
    2: {
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

// const serialID = primary(z.number().int().positive());
// const uuid = primary(z.string().uuid());

export const schema = {
  users: z.record(z.object({
    name: z.string(),
    age: z.number().int().positive()
  }))
};
