import { FastifyInstance } from "fastify";
import { db } from "./db.js";

type GetUserEndpoint = {
  Params: {
    key: string;
  };
};

export function userPlugin(server: FastifyInstance, { client }: typeof db, done: (err?: Error) => void) {
  // Create a new user
  server.post("/user", async (request, reply) => {
    const body = client.users.schema().element.safeParse(request.body);
    if(body.success) {
      const user = await client.users.add(client.users.serialID, body.data);
      if(user !== undefined) {
        reply.send({
          key: user[0],
          ...user[1]
        });
      } else {
        reply.code(500).send({ error: "Failed to create user" });
      }
    } else {
      reply.code(400).send({ error: "Invalid data" });
    }
  });
  // Get a user by key
  server.get<GetUserEndpoint>("/user/:key", async (request, reply) => {
    const userKey = request.params.key;
    const user = await client.users.get(userKey);
    if(user !== undefined) {
      reply.send(user);
    } else {
      reply.code(404).send({ error: "User not found" });
    }
  });
  done();
}
