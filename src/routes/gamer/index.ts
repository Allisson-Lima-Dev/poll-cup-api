import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { Authenticate } from "../../plugins/authenticate";

const auth = new Authenticate();

export class Gamer {
  async getGamer(fastify: FastifyInstance) {
    fastify.get(
      "/polls/games/:id",
      { onRequest: [auth.verify] },
      async (req, res) => {
        const getPollParams = z.object({
          id: z.string(),
        });

        const { id } = getPollParams.parse(req.params);

        const games = await prisma.game.findMany({
          orderBy: {
            date: "desc",
          },
          include: {
            guesses: {
              where: {
                participant: {
                  userId: req.user.sub,
                  poolId: id,
                },
              },
            },
          },
        });

        return {
          games: games.map((game) => {
            return {
              ...game,
              guess: game.guesses?.length > 0 ? game.guesses[0] : null,
              guesses: undefined,
            };
          }),
        };
      }
    );
  }
}
