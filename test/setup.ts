import { tmpdir } from "os";
import z from "zod";
import mock, { restore } from "mock-fs";
import { arrayTable, recordTable } from "../source/index.js";

export const data = {
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
    id: 1,
    title: "Hello World",
    content: "Lorem ipsum dolor sit amet"
  }, {
    id: 2,
    title: "Second Post",
    content: null
  }],
  items: ["a", "b", "c", null]
};

export function setup() {
  mock({
    [tmpdir()]: {},
    "data.json": JSON.stringify(data),
    "/no-access": mock.directory({ mode: 0 })
  }, {
    createTmp: false
  });
}

export {
  restore
};

export const schema = {
  users: recordTable({
    name: z.string(),
    age: z.number().int().positive().optional()
  }),
  posts: arrayTable({
    id: z.number().int().positive(),
    title: z.string(),
    content: z.union([z.string(), z.null()])
  }),
  items: arrayTable(z.union([z.string(), z.null()]))
};
