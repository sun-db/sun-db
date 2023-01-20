import { tmpdir } from "os";
import z from "zod";
import mock, { restore } from "mock-fs";
import { arrayTable, recordTable } from "../source/index.js";

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

export const schema = {
  users: recordTable({
    name: z.string(),
    age: z.number().int().positive()
  }),
  posts: arrayTable({
    title: z.string(),
    content: z.string()
  })
};
