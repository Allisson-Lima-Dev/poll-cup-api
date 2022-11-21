import axios from "axios";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { authRoutes } from "./auth";
import { Gamer } from "./gamer";
import { CreateGuesses, Guesses } from "./guesses";
import { CreatePolls, ParticipantPoll, PollDetails, Polls } from "./poll";
import { SignInCredentials, UserCreate, Users } from "./users";

class Start {
  async init(fastify: FastifyInstance) {
    fastify.get("/", async () => {
      return { result: "Hello World" };
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
  UserCreate,
  SignInCredentials,
};
