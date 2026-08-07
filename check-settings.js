const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const settings = await prisma.appSetting.findMany();
  console.log("App Settings:", settings);
}

check().catch(console.error).finally(() => prisma.$disconnect());
