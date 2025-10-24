type PrismaClientType = import('@prisma/client').PrismaClient;

type PrismaTestClient = {
  user: Record<string, unknown>;
  dmcaNotice: Record<string, unknown>;
};

let prisma: PrismaClientType | PrismaTestClient;

if (process.env.NODE_ENV === 'test') {
  prisma = { user: {}, dmcaNotice: {} } satisfies PrismaTestClient;
} else {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
}

export { prisma };
