const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const plans = [
    {
      name: "Free Plan",
      price: 0,
      durationDays: 36500, // unlimited days
      hasWatermark: true,
      dailyLimit: 3
    },
    {
      name: "7-Day Trial",
      price: 0,
      durationDays: 7,
      hasWatermark: true,
      dailyLimit: null // unlimited
    },
    {
      name: "3 Month Plan",
      price: 3999,
      durationDays: 90,
      hasWatermark: false,
      dailyLimit: null
    },
    {
      name: "6 Month Plan",
      price: 6999,
      durationDays: 180,
      hasWatermark: false,
      dailyLimit: null
    },
    {
      name: "1 Year Plan",
      price: 11999,
      durationDays: 365,
      hasWatermark: false,
      dailyLimit: null
    }
  ];

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.subscriptionPlan.create({ data: plan });
      console.log(`Created plan: ${plan.name}`);
    }
  }

  // Create default admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nextgenbilling.com';
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        mobile: "0000000000",
        passwordHash,
      }
    });
    console.log("Created Admin User in isolated table");
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
