import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import {
  CreatePolls,
  Polls,
  Users,
  Guesses,
  Start,
  authRoutes,
  ParticipantPoll,
  PollDetails,
  Gamer,
  CreateGuesses,
  UserCreate,
  SignInCredentials,
} from "./routes";

async function boostrap() {
  const fastify = Fastify({
    logger: true,
  });
  await fastify.register(cors, {
    origin: true,
  });
  const initRouter = new Start();
  const authRouter = new authRoutes();

  const usersRouter = new Users();
  const userCreate = new UserCreate();
  const signInCredentials = new SignInCredentials();

  const guesess = new CreateGuesses();
  const guesessRouter = new Guesses();

  const pollRouter = new Polls();
  const createPollRouter = new CreatePolls();
  const listPolls = new ParticipantPoll();
  const pollsDetails = new PollDetails();

  const gamer = new Gamer();

  const secret = process.env.SECRET || "adas4d54a5s5a4sd5a4sdasdjskahsdhg%$*";

  fastify.register(jwt, {
    secret,
  });

  fastify.register(require("fastify-bcrypt"), {
    saltWorkFactor: 12,
  });

  fastify.register(initRouter.init);

  fastify.register(authRouter.authUser);

  fastify.register(authRouter.me);

  fastify.register(createPollRouter.createPolls);
  fastify.register(pollRouter.getPolls);
  fastify.register(pollsDetails.getPollDetails);
  fastify.register(listPolls.inPolls);
  fastify.register(listPolls.getPolls);

  fastify.register(gamer.getGamer);

  fastify.register(usersRouter.getUsers);
  fastify.register(userCreate.create);
  fastify.register(signInCredentials.signIn);

  fastify.register(guesessRouter.getGuesses);
  fastify.register(guesess.createdGuesses);

  await fastify.listen({ port: 3333, host: "0.0.0.0" });
}
boostrap();
