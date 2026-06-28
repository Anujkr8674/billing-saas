const fs = require('fs');
const file = 'd:/Nextgen/billing-software/app/actions/documents.ts';

let content = fs.readFileSync(file, 'utf8');

const newCode = `

// -----------------------------------------------------------------------------
// Money Receipts
// -----------------------------------------------------------------------------

export async function getMoneyReceipts() {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  return await prisma.moneyReceipt.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getMoneyReceiptById(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  return await prisma.moneyReceipt.findFirst({
    where: { id, userId: session.userId }
  });
}

export async function createMoneyReceipt(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  
  const result = await prisma.moneyReceipt.create({
    data: {
      userId: session.userId,
      docNumber: \`MR-\${Date.now()}\`,
      receivedFrom: data.receivedFrom,
      amount: parseFloat(data.amount) || 0,
      date: new Date(data.date),
      details: data
    }
  });
  
  revalidatePath('/user/money-receipts');
  return result;
}

export async function updateMoneyReceipt(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  
  const result = await prisma.moneyReceipt.update({
    where: { id, userId: session.userId },
    data: {
      receivedFrom: data.receivedFrom,
      amount: parseFloat(data.amount) || 0,
      date: new Date(data.date),
      details: data
    }
  });
  
  revalidatePath(\`/user/money-receipts/\${id}\`);
  revalidatePath('/user/money-receipts');
  return result;
}

export async function deleteMoneyReceipt(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  
  await prisma.moneyReceipt.delete({
    where: { id, userId: session.userId }
  });
  
  revalidatePath('/user/money-receipts');
  return true;
}
`;

if (!content.includes('getMoneyReceipts')) {
  fs.appendFileSync(file, newCode);
  console.log('Money Receipts actions added to documents.ts');
} else {
  console.log('Money Receipts actions already exist.');
}
