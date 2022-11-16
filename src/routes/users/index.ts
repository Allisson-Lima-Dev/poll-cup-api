import { FastifyInstance, FastifyRequest } from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
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

      const passwordHash = await fastify.bcrypt.hash("123");
      const checkPassword = await fastify.bcrypt.compare("123", passwordHash);
      return {
        count: counts,
        passwordHash,
        checkPassword: !checkPassword ? "Senha Invalida" : "Correta 🥳",
      };
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
            required_error: "Nome Obrigatório",
          }),
          password: z.string({
            required_error: "Senha Obrigatório",
          }),
          picture: z.string().url().optional(),
        });

        const { password, picture, ...rest } = userSchema.parse(req.body);
        const passwordHash = await fastify.bcrypt.hash(password);

        let user = await prisma.user.create({
          data: {
            password: passwordHash,
            avatarUrl:
              picture ||
              "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
            ...rest,
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

export class SignInCredentials {
  async signIn(fastify: FastifyInstance) {
    fastify.post("/signIn", async (req, res) => {
      try {
        const signInSchema = z.object({
          email: z
            .string({
              required_error: "Email Obrigatório",
            })
            .email("Email inválido"),
          password: z.string({
            required_error: "Senha Obrigatório",
          }),
        });
        const { email, password } = signInSchema.parse(req.body);

        let user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (!user) {
          return res.status(404).send({ result: "Usuário não encontrado" });
        }

        const checkPassword = await fastify.bcrypt.compare(
          password,
          user?.password || ""
        );
        if (!checkPassword) {
          return res.status(404).send({ result: "Credências incorretas" });
        }

        const token = fastify.jwt.sign(
          {
            name: user?.name,
            email: user?.email,
            avatarUrl: user?.avatarUrl,
          },
          {
            sub: user?.id,
            expiresIn: "1 days",
          }
        );
        return {
          token,
        };
      } catch (error) {
        return res.status(500).send({
          error,
        });
      }
    });
  }
}
