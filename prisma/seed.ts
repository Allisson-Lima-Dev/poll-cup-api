import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Jhon Dow",
      email: "john.doe@gmail.com",
      avatarUrl: "https://github.com/allisson-lima-dev.png",
    },
  });
  const pool = await prisma.pool.create({
    data: {
      title: "Example Pool",
      code: "BOL123",
      ownerId: user.id,
      participants: {
        create: {
          userId: user.id,
        },
      },
    },
  });

  const gamerFirst = await prisma.game.create({
    data: {
      date: "2022-11-03T14:00:00.201Z",
      firstTeamCountryCode: "DE",
      secondTeamCountryCode: "BR",
    },
  });
  const gamer = await prisma.game.create({
    data: {
      date: "2022-11-11T14:00:00.201Z",
      firstTeamCountryCode: "BR",
      secondTeamCountryCode: "AR",
      guesses: {
        create: {
          firstTeamPoints: 2,
          secondTeamPoints: 1,
          participant: {
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id,
              },
            },
          },
        },
      },
    },
  });
}

main();
