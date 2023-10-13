import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// https://op.gg/api/v1.0/internal/bypass/summoners/kr/autocomplete?keyword=123123

const go = async () => {
  const prisma = new PrismaClient();
  const res = await prisma.highlightResource.findMany({
    include: {
      highlightPlayers: {
        include: {
          participant: {
            include: {
              summoner: {
                include: {
                  progamer: {
                    include: {
                      proTeam: {},
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  console.log(JSON.stringify(res, null, 4));
};
go();
