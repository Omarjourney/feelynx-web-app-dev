let prisma;
if (process.env.NODE_ENV === 'test') {
  prisma = { user: {}, dmcaNotice: {} };
} else {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
}
export { prisma };
