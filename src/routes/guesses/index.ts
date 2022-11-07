import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { Authenticate } from "../../plugins/authenticate";

const auth = new Authenticate();

export class Guesses {
  async getGuesses(fastify: FastifyInstance) {
    fastify.get("/guesess/count", async (req, res) => {
      const guesess = await prisma.guess.count();

      return { count: guesess };
    });
  }
}

export class CreateGuesses {
  async createdGuesses(fastify: FastifyInstance) {
    fastify.post(
      "/polls/:pollId/games/:gameId/guesses",
      { onRequest: [auth.verify] },
      async (req, res) => {
        const createGuessesParams = z.object({
          pollId: z.string(),
          gameId: z.string(),
        });

        const createGuessesBody = z.object({
          firstTeamPoints: z.number(),
          secondTeamPoints: z.number(),
        });

        const { gameId, pollId } = createGuessesParams.parse(req.params);
        const { firstTeamPoints, secondTeamPoints } = createGuessesBody.parse(
          req.body
        );

        const participant = await prisma.participant.findUnique({
          where: {
            userId_poolId: {
              poolId: pollId,
              userId: req.user.sub,
            },
          },
        });

        if (!participant) {
          return res.status(400).send({
            message: "Não tem participantes",
          });
        }

        const guess = await prisma.guess.findUnique({
          where: {
            participantId_gameId: {
              participantId: participant.id,
              gameId,
            },
          },
        });

        if (guess) {
          return res.status(400).send({
            message: "Uma aposta já existente",
          });
        }

        const game = await prisma.game.findUnique({
          where: {
            id: gameId,
          },
        });

        if (!game) {
          return res.status(400).send({
            message: "Jogo não existente",
          });
        }
        if (game.date < new Date()) {
          return res.status(400).send({
            message: "Você não pode enviar palpites após a data do jogo",
          });
        }

        await prisma.guess.create({
          data: {
            gameId,
            participantId: participant.id,
            firstTeamPoints,
            secondTeamPoints,
          },
        });

        return res.status(202).send({
          message: "Aposta criado com sucesso!",
        });
      }
    );
  }
}
