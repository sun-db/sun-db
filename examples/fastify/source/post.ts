import { FastifyInstance } from "fastify";
import { db } from "./db.js";

type GetPostEndpoint = {
  Params: {
    id: string;
  };
};

export function postPlugin(server: FastifyInstance, { client }: typeof db, done: (err?: Error) => void) {
  // Create a new post
  server.post("/post", async (request, reply) => {
    const body = client.posts.schema().element.omit({ id: true }).safeParse(request.body);
    if(body.success) {
      const post = await client.posts.insert({ ...body.data, id: client.posts.uuid });
      reply.send(post);
    } else {
      reply.code(400).send({ error: "Invalid data" });
    }
  });
  // Get a post by id
  server.get<GetPostEndpoint>("/post/:id", async (request, reply) => {
    const postID = client.posts.schema().element.shape.id.safeParse(request.params.id);
    if(postID.success) {
      const post = await client.posts.selectFirst({ where: { id: { eq: postID.data } } });
      if(post !== undefined) {
        reply.send(post);
      } else {
        reply.code(404).send({ error: "Post not found" });
      }
    } else {
      reply.code(400).send({ error: "Invalid ID" });
    }
  });
  done();
}
