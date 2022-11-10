import axios from "axios";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authRoutes } from "./auth";
import { Gamer } from "./gamer";
import { CreateGuesses, Guesses } from "./guesses";
import { CreatePolls, ParticipantPoll, PollDetails, Polls } from "./poll";
import { Users } from "./users";

class Start {
  async init(fastify: FastifyInstance) {
    fastify.get("/", async () => {
      const pool = await prisma.pool.findMany();
      const counts = await prisma.pool.count();

      axios.post("https://ntfy.sh/mytopic", {
        method: "POST", // PUT works too
        body: "Backup successful 😀",
      });

      return { pool, count: counts };
    });
  }
}

export {
  Guesses,
  CreatePolls,
  Polls,
  Users,
  Start,
  authRoutes,
  ParticipantPoll,
  PollDetails,
  Gamer,
  CreateGuesses,
};
