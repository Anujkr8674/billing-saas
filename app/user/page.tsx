import {
  FileText, Receipt, Truck, Wallet,
  ClipboardList, FileSpreadsheet, FileCheck,
  Package, Banknote, Coins, Car, ShieldCheck
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import DashboardCharts from "./DashboardCharts";
import RecentBillingClient from "./RecentBillingClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) return null;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const queryOptions = {
    where: { userId: session.userId, createdAt: { gte: sevenDaysAgo } },
    orderBy: { createdAt: 'desc' as const },
  };

  const [
    surveys, quotations, invoices, loadingSlips, lorryReceipts,
    packingLists, paymentVouchers, moneyReceipts, vehicleConditions, nocForms,
    subscription,
    recentSurveys, recentQuotations, recentInvoices, recentLoadingSlips,
    recentLorryReceipts, recentPackingLists, recentPaymentVouchers,
    recentMoneyReceipts, recentVehicleConditions, recentNocForms
  ] = await Promise.all([
    prisma.survey.count({ where: { userId: session.userId } }),
    prisma.quotation.count({ where: { userId: session.userId } }),
    prisma.invoice.count({ where: { userId: session.userId } }),
    prisma.loadingSlip.count({ where: { userId: session.userId } }),
    prisma.lorryReceipt.count({ where: { userId: session.userId } }),
    prisma.packingList.count({ where: { userId: session.userId } }),
    prisma.paymentVoucher.count({ where: { userId: session.userId } }),
    prisma.moneyReceipt.count({ where: { userId: session.userId } }),
    prisma.vehicleCondition.count({ where: { userId: session.userId } }),
    prisma.nOCForm.count({ where: { userId: session.userId } }),
    prisma.userSubscription.findFirst({
      where: { userId: session.userId, isActive: true },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.survey.findMany(queryOptions),
    prisma.quotation.findMany(queryOptions),
    prisma.invoice.findMany(queryOptions),
    prisma.loadingSlip.findMany(queryOptions),
    prisma.lorryReceipt.findMany(queryOptions),
    prisma.packingList.findMany(queryOptions),
    prisma.paymentVoucher.findMany(queryOptions),
    prisma.moneyReceipt.findMany(queryOptions),
    prisma.vehicleCondition.findMany(queryOptions),
    prisma.nOCForm.findMany(queryOptions),
  ]);

  const totalDocuments = surveys + quotations + invoices + loadingSlips + lorryReceipts +
    packingLists + paymentVouchers + moneyReceipts + vehicleConditions + nocForms;

  const stats = [
    { name: "Total Documents", value: totalDocuments.toString(), icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { name: "Total Invoices", value: invoices.toString(), icon: Receipt, color: "text-green-500", bg: "bg-green-500/10" },
    { name: "Total Quotations", value: quotations.toString(), icon: FileSpreadsheet, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const documentStats = [
    { name: "Surveys", value: surveys, icon: ClipboardList, href: "/user/surveys", color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Quotations", value: quotations, icon: FileSpreadsheet, href: "/user/quotations", color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "Invoices", value: invoices, icon: Receipt, href: "/user/invoices", color: "text-green-500", bg: "bg-green-500/10" },
    { name: "Loading Slips", value: loadingSlips, icon: Truck, href: "/user/loading-slips", color: "text-orange-500", bg: "bg-orange-500/10" },
    { name: "Lorry Receipts", value: lorryReceipts, icon: FileCheck, href: "/user/lorry-receipts", color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "Packing Lists", value: packingLists, icon: Package, href: "/user/packing-lists", color: "text-pink-500", bg: "bg-pink-500/10" },
    { name: "Payment Vouchers", value: paymentVouchers, icon: Banknote, href: "/user/payment-vouchers", color: "text-teal-500", bg: "bg-teal-500/10" },
    { name: "Money Receipts", value: moneyReceipts, icon: Coins, href: "/user/money-receipts", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { name: "Vehicle Conditions", value: vehicleConditions, icon: Car, href: "/user/vehicle-conditions", color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { name: "NOC Forms", value: nocForms, icon: ShieldCheck, href: "/user/noc-forms", color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  const allRecentDocs = [
    ...recentSurveys.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'Survey', typeSlug: 'surveys', label: d.clientName || 'N/A' })),
    ...recentQuotations.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'Quotation', typeSlug: 'quotations', label: d.clientName || 'N/A' })),
    ...recentInvoices.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'Invoice', typeSlug: 'invoices', label: d.clientName || 'N/A' })),
    ...recentLoadingSlips.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'Loading Slip', typeSlug: 'loading-slips', label: d.vehicleNo || d.driverName || 'N/A' })),
    ...recentLorryReceipts.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'Lorry Receipt', typeSlug: 'lorry-receipts', label: d.consignor || d.consignee || 'N/A' })),
    ...recentPackingLists.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'Packing List', typeSlug: 'packing-lists', label: d.referenceNo || 'N/A' })),
    ...recentPaymentVouchers.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'Payment Voucher', typeSlug: 'payment-vouchers', label: d.paidTo || 'N/A' })),
    ...recentMoneyReceipts.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'Money Receipt', typeSlug: 'money-receipts', label: d.receivedFrom || 'N/A' })),
    ...recentVehicleConditions.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'Vehicle Condition', typeSlug: 'vehicle-conditions', label: d.vehicleNo || 'N/A' })),
    ...recentNocForms.map(d => ({ id: d.id, docNumber: d.docNumber, createdAt: d.createdAt, type: 'NOC Form', typeSlug: 'noc-forms', label: d.clientName || 'N/A' })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="p-6 bg-card rounded-xl border border-border shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>



      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-4">Documents Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {documentStats.map((doc) => {
            const Icon = doc.icon;
            return (
              <Link key={doc.name} href={doc.href} className="p-4 border border-border rounded-lg flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/5 transition-colors group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${doc.bg} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${doc.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{doc.value}</p>
                <p className="text-xs font-medium text-muted-foreground">{doc.name}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <RecentBillingClient data={allRecentDocs} />
      <DashboardCharts />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/user/surveys" className="p-4 border border-border rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors block">
              <FileText className="w-6 h-6 text-primary mb-2" />
              <p className="font-medium text-foreground">Manage Surveys</p>
              <p className="text-xs text-muted-foreground">View & create surveys</p>
            </Link>
            <Link href="/user/invoices" className="p-4 border border-border rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors block">
              <Receipt className="w-6 h-6 text-primary mb-2" />
              <p className="font-medium text-foreground">Manage Invoices</p>
              <p className="text-xs text-muted-foreground">View & create invoices</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
