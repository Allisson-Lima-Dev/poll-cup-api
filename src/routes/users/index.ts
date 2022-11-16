import { FastifyInstance, FastifyRequest } from "fastify";
import { z, AnyZodObject } from "zod";
import { prisma } from "../../lib/prisma";

export class Validation {
  async schema(req: FastifyRequest) {
    try {
      const userSchema = z.object({
        email: z
          .string({
            required_error: "Email Obrigatório",
          })
          .email("Email inválido"),
        name: z.string({
          required_error: "Name Obrigatório",
        }),
        picture: z.string(),
      });

      const userBody = await userSchema.parseAsync(req.body);
      return {
        userBody,
      };
    } catch (error) {}
  }
}

const checkBody = new Validation();

export class Users {
  async getUsers(fastify: FastifyInstance) {
    fastify.get("/users/count", async (req, res) => {
      const counts = await prisma.user.count();

      return { count: counts };
    });
  }
}

export class UserCreate {
  async create(fastify: FastifyInstance) {
    fastify.post("/user/create", async (req, res) => {
      try {
        const userSchema = z.object({
          email: z
            .string({
              required_error: "Email Obrigatório",
            })
            .email("Email inválido"),
          name: z.string({
            required_error: "Name Obrigatório",
          }),
          picture: z.string().url().optional(),
        });

        const userBody = userSchema.parse(req.body);

        let user = await prisma.user.create({
          data: {
            name: userBody.name,
            avatarUrl:
              userBody.picture ||
              "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
            email: userBody.email,
          },
        });

        return res.status(201).send({
          user,
        });
      } catch (error) {
        return res.status(500).send({
          error,
        });
      }
    });
  }
}
