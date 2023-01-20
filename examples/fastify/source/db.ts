import { SunDB, arrayTable, recordTable } from "sun-db";
import z from "zod";

export const db = new SunDB("db.json", {
  users: recordTable({
    name: z.string(),
    email: z.string().email(),
  }),
  posts: arrayTable({
    id: z.string().uuid(),
    title: z.string(),
    content: z.string(),
    authorKey: z.string()
  })
});

export type Client = typeof db.client;
