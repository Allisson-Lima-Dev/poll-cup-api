import { FastifyInstance } from "fastify";
import axios from "axios";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { Authenticate } from "../plugins/authenticate";

const auth = new Authenticate();

export class authRoutes {
  async me(fastify: FastifyInstance) {
    fastify.get("/me", { onRequest: [auth.verify] }, async (req) => {
      return {
        user: req.user,
      };
    });
  }

  async authUser(fastify: FastifyInstance) {
    fastify.post("/users", async (req, res) => {
      try {
        const secret = process.env.SECRET;
        const createUserBody = z.object({
          access_token: z.string(),
        });

        const { access_token } = createUserBody.parse(req.body);

        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        const userSchema = z.object({
          id: z.string(),
          email: z.string().email(),
          name: z.string(),
          picture: z.string().url(),
        });

        const userInfo = userSchema.parse(data);

        let user = await prisma.user.findUnique({
          where: {
            googleId: userInfo.id,
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: userInfo.name,
              avatarUrl: userInfo.picture,
              email: userInfo.email,
              googleId: userInfo.id,
            },
          });
        }

        const token = fastify.jwt.sign(
          {
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          {
            sub: user.id,
            expiresIn: "1 days",
          }
        );

        return {
          token,
        };
      } catch (error) {
        console.log({ error });
      }
    });
  }
}
