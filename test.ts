import z from "zod";
import { recordTable, arrayTable } from "./source/index.js";

const schema = z.object({
  users: recordTable({
    name: z.string(),
    age: z.number().int().positive()
  }),
  posts: arrayTable({
    id: z.number().int().positive(),
    title: z.string(),
    content: z.union([z.string(), z.null()])
  })
}).partial();

console.log(schema.parse({}));
