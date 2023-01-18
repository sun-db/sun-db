import { tmpdir } from "os";
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
  },
  posts: [{
    title: "Hello World",
    content: "Lorem ipsum dolor sit amet"
  }]
};

export function setup() {
  mock({
    [tmpdir()]: {},
    "data.json": JSON.stringify(db)
  }, {
    createTmp: false
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
  })),
  posts: z.array(z.object({
    title: z.string(),
    content: z.string()
  }))
};
