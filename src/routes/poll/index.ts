import { FastifyInstance } from "fastify";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { Authenticate } from "../../plugins/authenticate";

const auth = new Authenticate();

export class CreatePolls {
  async createPolls(fastify: FastifyInstance) {
    fastify.post("/polls", async (req, res) => {
      const generate = new ShortUniqueId({ length: 6 });
      const createPoolBody = z.object({
        title: z.string(),
      });
      const code = String(generate()).toUpperCase();
      const { title } = createPoolBody.parse(req.body);

      try {
        await req.jwtVerify();

        await prisma.pool.create({
          data: {
            title,
            code,
            ownerId: req.user.sub,
            participants: {
              create: {
                userId: req.user.sub,
              },
            },
          },
        });
      } catch (error) {
        await prisma.pool.create({
          data: {
            title,
            code,
          },
        });
      }

      return res.status(201).send({ code });
    });
  }
}

export class Polls {
  async getPolls(fastify: FastifyInstance) {
    fastify.get("/polls/count", async (req, res) => {
      const pool = await prisma.pool.findMany();
      const counts = await prisma.pool.count();

      return { pool, count: counts };
    });
  }
}

export class ParticipantPoll {
  async inPolls(fastify: FastifyInstance) {
    fastify.post(
      "/polls/join",
      { onRequest: [auth.verify] },
      async (req, res) => {
        const joinPollBody = z.object({
          code: z.string(),
        });
        const { code } = joinPollBody.parse(req.body);

        const poll = await prisma.pool.findUnique({
          where: {
            code,
          },
          include: {
            participants: {
              where: {
                userId: req.user.sub,
              },
            },
          },
        });

        if (!poll) {
          return res.status(400).send({
            message: "Poll not found.",
          });
        }
        if (poll.participants?.length > 0) {
          return res.status(400).send({
            message: "You already joined this poll.",
          });
        }

        if (!poll.ownerId) {
          await prisma.pool.update({
            where: {
              id: poll.id,
            },
            data: {
              ownerId: req.user.sub,
            },
          });
        }

        await prisma.participant.create({
          data: {
            poolId: poll.id,
            userId: req.user.sub,
          },
        });

        return res.status(201).send({
          result: "Success",
        });
      }
    );
  }

  async getPolls(fastify: FastifyInstance) {
    fastify.get("/polls", { onRequest: [auth.verify] }, async (req) => {
      const polls = await prisma.pool.findMany({
        where: {
          participants: {
            some: {
              userId: req.user.sub,
            },
          },
        },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
          participants: {
            select: {
              id: true,
              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
            take: 4,
          },
          owner: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      return {
        polls,
      };
    });
  }
}

export class PollDetails {
  async getPollDetails(fastify: FastifyInstance) {
    fastify.get(
      "/polls/:id",
      { onRequest: [auth.verify] },
      async (req, res) => {
        const getPollParams = z.object({
          id: z.string(),
        });
        const { id } = getPollParams.parse(req.params);

        const polls = await prisma.pool.findUnique({
          where: {
            id,
          },
          include: {
            _count: {
              select: {
                participants: true,
              },
            },
            participants: {
              select: {
                id: true,
                user: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
              take: 4,
            },
            owner: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        });
        return { polls };
      }
    );
  }
}
