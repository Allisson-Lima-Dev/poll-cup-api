import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma";

export class Authenticate {
  async verify(request: FastifyRequest) {
    await request.jwtVerify();
  }
}
