import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (startDateParam) {
      const parsedStart = new Date(startDateParam);
      if (!isNaN(parsedStart.getTime())) {
        startDate = parsedStart;
        startDate.setHours(0, 0, 0, 0);
      }
    }
    
    if (endDateParam) {
      const parsedEnd = new Date(endDateParam);
      if (!isNaN(parsedEnd.getTime())) {
        endDate = parsedEnd;
        endDate.setHours(23, 59, 59, 999);
      }
    }

    const queryOptions = {
      where: {
        userId: session.userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      }
    };

    // Fetch data
    const [invoices, quotations, moneyReceipts, paymentVouchers] = await Promise.all([
      prisma.invoice.findMany(queryOptions),
      prisma.quotation.findMany(queryOptions),
      prisma.moneyReceipt.findMany(queryOptions),
      prisma.paymentVoucher.findMany(queryOptions),
    ]);

    // Calculate Billing Pie Chart Data
    const totalInvoiceAmount = invoices.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalQuotationAmount = quotations.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    
    const billingData = [
      { name: "Invoices", value: totalInvoiceAmount, fill: "#22c55e" }, // green-500
      { name: "Quotations", value: totalQuotationAmount, fill: "#a855f7" }, // purple-500
    ];

    // Calculate Payment Pie Chart Data
    const totalReceiptsAmount = moneyReceipts.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalVouchersAmount = paymentVouchers.reduce((sum, item) => sum + (item.amount || 0), 0);

    const paymentData = [
      { name: "Money Receipts (Inflow)", value: totalReceiptsAmount, fill: "#eab308" }, // yellow-500
      { name: "Payment Vouchers (Outflow)", value: totalVouchersAmount, fill: "#14b8a6" }, // teal-500
    ];

    // Calculate Turnover Overview (Group by date)
    const turnoverMap = new Map<string, { date: string; inflow: number; outflow: number }>();

    // Helper to format date to YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    moneyReceipts.forEach(item => {
      const d = formatDate(item.createdAt);
      if (!turnoverMap.has(d)) turnoverMap.set(d, { date: d, inflow: 0, outflow: 0 });
      turnoverMap.get(d)!.inflow += (item.amount || 0);
    });

    paymentVouchers.forEach(item => {
      const d = formatDate(item.createdAt);
      if (!turnoverMap.has(d)) turnoverMap.set(d, { date: d, inflow: 0, outflow: 0 });
      turnoverMap.get(d)!.outflow += (item.amount || 0);
    });

    // Convert map to array and sort by date
    const turnoverData = Array.from(turnoverMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      billingData,
      paymentData,
      turnoverData,
      summary: {
        totalInflow: totalReceiptsAmount,
        totalOutflow: totalVouchersAmount,
        totalBilled: totalInvoiceAmount,
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
