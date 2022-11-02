import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import ShortUniqueId from "short-unique-id";

const prisma = new PrismaClient({
  log: ["query"],
});

async function boostrap() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  fastify.get("/", async () => {
    const pool = await prisma.pool.findMany();
    const counts = await prisma.pool.count();

    return { pool, count: counts };
  });

  fastify.get("/pools/count", async (req, res) => {
    const pool = await prisma.pool.findMany();
    const counts = await prisma.pool.count();

    return { pool, count: counts };
  });

  fastify.get("/users/count", async (req, res) => {
    const counts = await prisma.user.count();

    return { count: counts };
  });
  fastify.get("/guesess/count", async (req, res) => {
    const guesess = await prisma.guess.count();

    return { count: guesess };
  });

  fastify.post("/pools", async (req, res) => {
    const generate = new ShortUniqueId({ length: 6 });
    const createPoolBody = z.object({
      title: z.string(),
    });
    const code = String(generate()).toUpperCase();
    const { title } = createPoolBody.parse(req.body);

    await prisma.pool.create({
      data: {
        title,
        code,
      },
    });

    return res.status(201).send({ code });
  });

  await fastify.listen({ port: 3333, host: "0.0.0.0" });
}
boostrap();
