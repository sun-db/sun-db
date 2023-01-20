import z from "zod";
import { SunDB } from "../source/index.js";
import { generateUsers } from "./generate.js";
import { lessRandomValue } from "./random.js";
import { benchmark } from "./bench.js";
import { output } from "./output.js";

const schema = {
  users: z.array(z.object({
    id: z.string().uuid(),
    created_at: z.string(),
    updated_at: z.string(),
    name: z.string(),
    age: z.number().int().positive()
  }))
};

const db = new SunDB("./bench/data.json", schema);

let users: ReturnType<typeof generateUsers> = [];

// const noop = {
//   name: "noop",
//   fn: () => {}
// };

// const asyncNoop = {
//   name: "async noop",
//   fn: async () => {}
// };

function rawBenchmark(count: number) {
  return {
    name: `raw lookup: ${count}`,
    setup: () => {
      users = generateUsers(count);
    },
    fn: () => {
      const id = lessRandomValue(users).id;
      users.filter((user) => user.id === id);
    }
  };
}

function selectAllBenchmark(count: number) {
  return {
    name: `select all: ${count}`,
    setup: async () => {
      users = generateUsers(count);
      await db.client.users.truncate();
      await db.client.users.insertAll(users);
    },
    fn: async () => {
      const id = lessRandomValue(users).id;
      const all = await db.client.users.select();
      all.filter((user) => user.id === id);
    }
  };
}

function selectBenchmark(count: number) {
  return {
    name: `select: ${count}`,
    setup: async () => {
      users = generateUsers(count);
      await db.client.users.truncate();
      db.flush();
      await db.client.users.insertAll(users);
    },
    fn: async () => {
      const id = lessRandomValue(users).id;
      await db.client.users.select({ where: { id: { eq: id } } });
    }
  };
}

const tasks = await benchmark([
  // noop,
  // asyncNoop,
  rawBenchmark(1),
  rawBenchmark(10),
  rawBenchmark(100),
  rawBenchmark(1000),
  rawBenchmark(10000),
  selectAllBenchmark(1),
  selectAllBenchmark(10),
  selectAllBenchmark(100),
  selectAllBenchmark(1000),
  selectAllBenchmark(10000),
  selectBenchmark(1),
  selectBenchmark(10),
  selectBenchmark(100),
  selectBenchmark(1000),
  selectBenchmark(10000)
]);

output(tasks);
