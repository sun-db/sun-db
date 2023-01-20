import fastify from "fastify";
import { db } from "./db.js";
import { userPlugin } from "./user.js";
import { postPlugin } from "./post.js";

const server = fastify();

server.register(userPlugin, db);
server.register(postPlugin, db);

server.listen({ port: 3000 }).then((address) => {
  console.log(`Server listening at ${address}`);
});
