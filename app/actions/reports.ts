"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getDashboardReports() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.userId;
  const now = new Date();
  
  // Last 12 months date
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  // Fetch all relevant data for the user
  const [
    invoices,
    quotations,
    paymentVouchers,
    moneyReceipts,
    loadingSlips,
    lorryReceipts,
    packingLists,
    surveys,
    vehicleConditions,
    nocForms
  ] = await Promise.all([
    prisma.invoice.findMany({ where: { userId }, select: { date: true, totalAmount: true, status: true, clientName: true, docNumber: true } }),
    prisma.quotation.findMany({ where: { userId }, select: { date: true, totalAmount: true, clientName: true, docNumber: true } }),
    prisma.paymentVoucher.findMany({ where: { userId }, select: { date: true, amount: true, docNumber: true } }),
    prisma.moneyReceipt.findMany({ where: { userId }, select: { date: true, amount: true, docNumber: true } }),
    prisma.loadingSlip.count({ where: { userId } }),
    prisma.lorryReceipt.count({ where: { userId } }),
    prisma.packingList.count({ where: { userId } }),
    prisma.survey.count({ where: { userId } }),
    prisma.vehicleCondition.count({ where: { userId } }),
    prisma.nOCForm.count({ where: { userId } })
  ]);

  // KPIs
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalReceived = moneyReceipts.reduce((sum, mr) => sum + (mr.amount || 0), 0);
  const totalExpenses = paymentVouchers.reduce((sum, pv) => sum + (pv.amount || 0), 0);
  const totalQuotations = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

  // Invoice Status Distribution
  let paidInvoices = 0;
  let unpaidInvoices = 0;
  let draftInvoices = 0;

  invoices.forEach(inv => {
    if (inv.status === "PAID") paidInvoices++;
    else if (inv.status === "UNPAID") unpaidInvoices++;
    else draftInvoices++;
  });

  // Document Distribution
  const documentDistribution = [
    { name: 'Invoices', value: invoices.length },
    { name: 'Quotations', value: quotations.length },
    { name: 'Loading Slips', value: loadingSlips },
    { name: 'Lorry Receipts', value: lorryReceipts },
    { name: 'Packing Lists', value: packingLists },
    { name: 'Surveys', value: surveys },
    { name: 'Payment Vouchers', value: paymentVouchers.length },
    { name: 'Money Receipts', value: moneyReceipts.length },
    { name: 'Vehicle Cond.', value: vehicleConditions },
    { name: 'NOC Forms', value: nocForms },
  ].filter(item => item.value > 0);

  // Default to zeros if no documents exist
  if (documentDistribution.length === 0) {
    documentDistribution.push({ name: 'No Data', value: 1 });
  }

  // Monthly Trend (Last 12 Months)
  const monthlyDataMap = new Map<string, { name: string, invoiced: number, received: number, expense: number }>();
  
  // Initialize the last 12 months in order
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const name = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    monthlyDataMap.set(key, { name, invoiced: 0, received: 0, expense: 0 });
  }

  const addToMonth = (dateStr: Date | string, amount: number, type: 'invoiced' | 'received' | 'expense') => {
    const d = new Date(dateStr);
    if (d >= twelveMonthsAgo) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = monthlyDataMap.get(key);
      if (entry) {
        entry[type] += (amount || 0);
      }
    }
  };

  invoices.forEach(inv => addToMonth(inv.date, inv.totalAmount, 'invoiced'));
  moneyReceipts.forEach(mr => addToMonth(mr.date, mr.amount, 'received'));
  paymentVouchers.forEach(pv => addToMonth(pv.date, pv.amount, 'expense'));

  const monthlyTrend = Array.from(monthlyDataMap.values());

  // Top Clients by Invoice Amount
  const clientMap = new Map<string, number>();
  invoices.forEach(inv => {
    if (inv.clientName) {
      const current = clientMap.get(inv.clientName) || 0;
      clientMap.set(inv.clientName, current + (inv.totalAmount || 0));
    }
  });
  const topClients = Array.from(clientMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Recent Activity (combine documents, sort by date)
  let allDocs: any[] = [];
  invoices.forEach(i => allDocs.push({ id: i.docNumber, type: 'Invoice', date: i.date, amount: i.totalAmount, client: i.clientName }));
  quotations.forEach(q => allDocs.push({ id: q.docNumber, type: 'Quotation', date: q.date, amount: q.totalAmount, client: q.clientName }));
  moneyReceipts.forEach(m => allDocs.push({ id: m.docNumber, type: 'Receipt', date: m.date, amount: m.amount, client: 'N/A' }));
  paymentVouchers.forEach(p => allDocs.push({ id: p.docNumber, type: 'Voucher', date: p.date, amount: p.amount, client: 'N/A' }));

  allDocs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentActivity = allDocs.slice(0, 6);

  return {
    kpis: {
      totalInvoiced,
      totalReceived,
      totalExpenses,
      totalQuotations,
    },
    invoiceStatuses: [
      { name: 'Paid', value: paidInvoices },
      { name: 'Unpaid', value: unpaidInvoices },
      { name: 'Draft', value: draftInvoices },
    ].filter(i => i.value > 0),
    documentDistribution,
    monthlyTrend,
    topClients,
    recentActivity
  };
}
