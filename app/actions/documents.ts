"use server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// -----------------------------------------------------------------------------
// SURVEYS
// -----------------------------------------------------------------------------
export async function getSurveys() {
  const session = await getSession();
  if (!session?.userId) return [];
  return await prisma.survey.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
}

export async function getSurveyById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.survey.findFirst({ where: { id, userId: session.userId } });
}

export async function createSurvey(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.survey.create({
    data: {
      userId: session.userId,
      docNumber: `SRV-${Date.now()}`,
      clientName: data.clientName,
      date: new Date(data.date),
      details: data.details || {}
    }
  });
  revalidatePath("/user/surveys");
  return result;
}

export async function updateSurvey(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.survey.update({
    where: { id, userId: session.userId },
    data: {
      clientName: data.clientName,
      date: new Date(data.date),
      details: data.details || {}
    }
  });
  revalidatePath("/user/surveys");
  return result;
}

export async function deleteSurvey(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.survey.delete({ where: { id, userId: session.userId } });
  revalidatePath("/user/surveys");
}

// -----------------------------------------------------------------------------
// QUOTATIONS
// -----------------------------------------------------------------------------
export async function getQuotations() {
  const session = await getSession();
  if (!session?.userId) return [];
  return await prisma.quotation.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
}

export async function getQuotationById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.quotation.findFirst({ where: { id, userId: session.userId } });
}

export async function createQuotation(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.quotation.create({
    data: {
      userId: session.userId,
      docNumber: `QTN-${Date.now()}`,
      clientName: data.clientName,
      totalAmount: parseFloat(data.totalAmount || 0),
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/quotations");
  return result;
}

export async function updateQuotation(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.quotation.update({
    where: { id, userId: session.userId },
    data: {
      clientName: data.clientName,
      totalAmount: parseFloat(data.totalAmount || 0),
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/quotations");
  return result;
}

export async function deleteQuotation(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.quotation.delete({ where: { id, userId: session.userId } });
  revalidatePath("/user/quotations");
}

// -----------------------------------------------------------------------------
// LOADING SLIPS
// -----------------------------------------------------------------------------
export async function getLoadingSlips() {
  const session = await getSession();
  if (!session?.userId) return [];
  return await prisma.loadingSlip.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
}

export async function getLoadingSlipById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.loadingSlip.findFirst({ where: { id, userId: session.userId } });
}

export async function createLoadingSlip(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.loadingSlip.create({
    data: {
      userId: session.userId,
      docNumber: `LS-${Date.now()}`,
      vehicleNo: data.vehicleNo,
      driverName: data.driverName,
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/loading-slips");
  return result;
}

export async function updateLoadingSlip(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.loadingSlip.update({
    where: { id, userId: session.userId },
    data: {
      vehicleNo: data.vehicleNo,
      driverName: data.driverName,
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/loading-slips");
  return result;
}

export async function deleteLoadingSlip(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.loadingSlip.delete({ where: { id, userId: session.userId } });
  revalidatePath("/user/loading-slips");
}

// -----------------------------------------------------------------------------
// LORRY RECEIPTS
// -----------------------------------------------------------------------------
export async function getLorryReceipts() {
  const session = await getSession();
  if (!session?.userId) return [];
  return await prisma.lorryReceipt.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
}

export async function getLorryReceiptById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.lorryReceipt.findFirst({ where: { id, userId: session.userId } });
}

export async function createLorryReceipt(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.lorryReceipt.create({
    data: {
      userId: session.userId,
      docNumber: `LR-${Date.now()}`,
      consignor: data.consignor,
      consignee: data.consignee,
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/lorry-receipts");
  return result;
}

export async function updateLorryReceipt(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.lorryReceipt.update({
    where: { id, userId: session.userId },
    data: {
      consignor: data.consignor,
      consignee: data.consignee,
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/lorry-receipts");
  return result;
}

export async function deleteLorryReceipt(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.lorryReceipt.delete({ where: { id, userId: session.userId } });
  revalidatePath("/user/lorry-receipts");
}

// -----------------------------------------------------------------------------
// PACKING LISTS
// -----------------------------------------------------------------------------
export async function getPackingLists() {
  const session = await getSession();
  if (!session?.userId) return [];
  return await prisma.packingList.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
}

export async function getPackingListById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.packingList.findFirst({ where: { id, userId: session.userId } });
}

export async function createPackingList(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.packingList.create({
    data: {
      userId: session.userId,
      docNumber: `PL-${Date.now()}`,
      referenceNo: data.referenceNo,
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/packing-lists");
  return result;
}

export async function updatePackingList(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.packingList.update({
    where: { id, userId: session.userId },
    data: {
      referenceNo: data.referenceNo,
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/packing-lists");
  return result;
}

export async function deletePackingList(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.packingList.delete({ where: { id, userId: session.userId } });
  revalidatePath("/user/packing-lists");
}

// -----------------------------------------------------------------------------
// PAYMENT VOUCHERS
// -----------------------------------------------------------------------------
export async function getPaymentVouchers() {
  const session = await getSession();
  if (!session?.userId) return [];
  return await prisma.paymentVoucher.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
}

export async function getPaymentVoucherById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.paymentVoucher.findFirst({ where: { id, userId: session.userId } });
}

export async function createPaymentVoucher(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.paymentVoucher.create({
    data: {
      userId: session.userId,
      docNumber: `PV-${Date.now()}`,
      paidTo: data.paidTo,
      amount: parseFloat(data.amount || 0),
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/payment-vouchers");
  return result;
}

export async function updatePaymentVoucher(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.paymentVoucher.update({
    where: { id, userId: session.userId },
    data: {
      paidTo: data.paidTo,
      amount: parseFloat(data.amount || 0),
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/payment-vouchers");
  return result;
}

export async function deletePaymentVoucher(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.paymentVoucher.delete({ where: { id, userId: session.userId } });
  revalidatePath("/user/payment-vouchers");
}

// -----------------------------------------------------------------------------
// MONEY RECEIPTS
// -----------------------------------------------------------------------------
export async function getMoneyReceipts() {
  const session = await getSession();
  if (!session?.userId) return [];
  return await prisma.moneyReceipt.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
}

export async function getMoneyReceiptById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.moneyReceipt.findFirst({ where: { id, userId: session.userId } });
}

export async function createMoneyReceipt(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.moneyReceipt.create({
    data: {
      userId: session.userId,
      docNumber: `MR-${Date.now()}`,
      receivedFrom: data.receivedFrom,
      amount: parseFloat(data.amount || 0),
      date: new Date(data.date),
      details: data.details || data // Ensure details captures full payload
    }
  });
  revalidatePath("/user/money-receipts");
  return result;
}

export async function updateMoneyReceipt(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.moneyReceipt.update({
    where: { id, userId: session.userId },
    data: {
      receivedFrom: data.receivedFrom,
      amount: parseFloat(data.amount || 0),
      date: new Date(data.date),
      details: data.details || data // Ensure details captures full payload
    }
  });
  revalidatePath("/user/money-receipts");
  return result;
}

export async function deleteMoneyReceipt(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.moneyReceipt.delete({ where: { id, userId: session.userId } });
  revalidatePath("/user/money-receipts");
}

// -----------------------------------------------------------------------------
// VEHICLE CONDITIONS
// -----------------------------------------------------------------------------
export async function getVehicleConditions() {
  const session = await getSession();
  if (!session?.userId) return [];
  return await prisma.vehicleCondition.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
}

export async function getVehicleConditionById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.vehicleCondition.findFirst({ where: { id, userId: session.userId } });
}

export async function createVehicleCondition(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.vehicleCondition.create({
    data: {
      userId: session.userId,
      docNumber: `VC-${Date.now()}`,
      vehicleNo: data.vehicleNo,
      date: new Date(data.date),
      details: data.details || {}
    }
  });
  revalidatePath("/user/vehicle-conditions");
  return result;
}

export async function updateVehicleCondition(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const result = await prisma.vehicleCondition.update({
    where: { id, userId: session.userId },
    data: {
      vehicleNo: data.vehicleNo,
      date: new Date(data.date),
      details: data.details || {}
    }
  });
  revalidatePath("/user/vehicle-conditions");
  return result;
}

export async function deleteVehicleCondition(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.vehicleCondition.delete({ where: { id, userId: session.userId } });
  revalidatePath("/user/vehicle-conditions");
}

// -----------------------------------------------------------------------------
// NOC FORMS
// -----------------------------------------------------------------------------
export async function getNOCForms() {
  const session = await getSession();
  if (!session?.userId) return [];
  return await prisma.nOCForm.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } });
}

export async function getNOCFormById(id: string) {
  const session = await getSession();
  if (!session?.userId) return null;
  return await prisma.nOCForm.findFirst({ where: { id, userId: session.userId } });
}

export async function createNOCForm(data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  const created = await prisma.nOCForm.create({
    data: {
      userId: session.userId,
      docNumber: `NOC-${Date.now()}`,
      clientName: data.clientName,
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/noc-forms");
  return created;
}

export async function updateNOCForm(id: string, data: any) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.nOCForm.update({
    where: { id, userId: session.userId },
    data: {
      clientName: data.clientName,
      date: new Date(data.date),
      details: data.details || []
    }
  });
  revalidatePath("/user/noc-forms");
}

export async function deleteNOCForm(id: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  await prisma.nOCForm.delete({ where: { id, userId: session.userId } });
  revalidatePath("/user/noc-forms");
}
