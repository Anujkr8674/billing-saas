const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  await prisma.subscriptionPlan.updateMany({
    where: { name: "3 Month Plan" },
    data: { price: 3999 }
  });
  await prisma.subscriptionPlan.updateMany({
    where: { name: "6 Month Plan" },
    data: { price: 6999 }
  });
  await prisma.subscriptionPlan.updateMany({
    where: { name: "1 Year Plan" },
    data: { price: 11999 }
  });
  console.log("Updated prices");
}

update().finally(() => prisma.$disconnect());
