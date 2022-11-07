import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";

export class Users {
  async getUsers(fastify: FastifyInstance) {
    fastify.get("/users/count", async (req, res) => {
      const counts = await prisma.user.count();

      return { count: counts };
    });
  }
}
