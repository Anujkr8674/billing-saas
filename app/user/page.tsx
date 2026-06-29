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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const queryOptions = {
    where: { userId: session.userId, createdAt: { gte: sevenDaysAgo } },
    orderBy: { createdAt: 'desc' as const },
  };

  const count30DaysOpts = {
    where: { userId: session.userId, createdAt: { gte: thirtyDaysAgo } }
  };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });

  const [
    surveys, quotations, invoices, loadingSlips, lorryReceipts,
    packingLists, paymentVouchers, moneyReceipts, vehicleConditions, nocForms,
    subscription,
    recentSurveys, recentQuotations, recentInvoices, recentLoadingSlips,
    recentLorryReceipts, recentPackingLists, recentPaymentVouchers,
    recentMoneyReceipts, recentVehicleConditions, recentNocForms,
    surveys30, quotations30, invoices30, loadingSlips30, lorryReceipts30,
    packingLists30, paymentVouchers30, moneyReceipts30, vehicleConditions30, nocForms30
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
    prisma.survey.count(count30DaysOpts),
    prisma.quotation.count(count30DaysOpts),
    prisma.invoice.count(count30DaysOpts),
    prisma.loadingSlip.count(count30DaysOpts),
    prisma.lorryReceipt.count(count30DaysOpts),
    prisma.packingList.count(count30DaysOpts),
    prisma.paymentVoucher.count(count30DaysOpts),
    prisma.moneyReceipt.count(count30DaysOpts),
    prisma.vehicleCondition.count(count30DaysOpts),
    prisma.nOCForm.count(count30DaysOpts),
  ]);

  const totalDocuments = surveys + quotations + invoices + loadingSlips + lorryReceipts +
    packingLists + paymentVouchers + moneyReceipts + vehicleConditions + nocForms;

  const last7DaysTotal = recentSurveys.length + recentQuotations.length + recentInvoices.length + 
    recentLoadingSlips.length + recentLorryReceipts.length + recentPackingLists.length + 
    recentPaymentVouchers.length + recentMoneyReceipts.length + recentVehicleConditions.length + recentNocForms.length;

  const last30DaysTotal = surveys30 + quotations30 + invoices30 + loadingSlips30 + lorryReceipts30 + 
    packingLists30 + paymentVouchers30 + moneyReceipts30 + vehicleConditions30 + nocForms30;

  const stats = [
    { name: "Total Documents", value: totalDocuments.toString(), icon: FileText, color: "text-primary", bg: "bg-primary/10", solidBg: "bg-primary" },
    { name: "Last 7 Days", value: last7DaysTotal.toString(), icon: FileText, color: "text-green-500", bg: "bg-green-500/10", solidBg: "bg-green-500" },
    { name: "Last 30 Days", value: last30DaysTotal.toString(), icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10", solidBg: "bg-purple-500" },
  ];

  const documentStats = [
    { name: "Surveys", value: surveys, icon: ClipboardList, href: "/user/surveys", color: "text-blue-500", bg: "bg-blue-500/10", solidBg: "bg-blue-500" },
    { name: "Quotations", value: quotations, icon: FileSpreadsheet, href: "/user/quotations", color: "text-purple-500", bg: "bg-purple-500/10", solidBg: "bg-purple-500" },
    { name: "Invoices", value: invoices, icon: Receipt, href: "/user/invoices", color: "text-green-500", bg: "bg-green-500/10", solidBg: "bg-green-500" },
    { name: "Loading Slips", value: loadingSlips, icon: Truck, href: "/user/loading-slips", color: "text-orange-500", bg: "bg-orange-500/10", solidBg: "bg-orange-500" },
    { name: "Lorry Receipts", value: lorryReceipts, icon: FileCheck, href: "/user/lorry-receipts", color: "text-indigo-500", bg: "bg-indigo-500/10", solidBg: "bg-indigo-500" },
    { name: "Packing Lists", value: packingLists, icon: Package, href: "/user/packing-lists", color: "text-pink-500", bg: "bg-pink-500/10", solidBg: "bg-pink-500" },
    { name: "Payment Vouchers", value: paymentVouchers, icon: Banknote, href: "/user/payment-vouchers", color: "text-teal-500", bg: "bg-teal-500/10", solidBg: "bg-teal-500" },
    { name: "Money Receipts", value: moneyReceipts, icon: Coins, href: "/user/money-receipts", color: "text-yellow-500", bg: "bg-yellow-500/10", solidBg: "bg-yellow-500" },
    { name: "Vehicle Conditions", value: vehicleConditions, icon: Car, href: "/user/vehicle-conditions", color: "text-cyan-500", bg: "bg-cyan-500/10", solidBg: "bg-cyan-500" },
    { name: "NOC Forms", value: nocForms, icon: ShieldCheck, href: "/user/noc-forms", color: "text-rose-500", bg: "bg-rose-500/10", solidBg: "bg-rose-500" },
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
      <div className="bg-primary/10 border border-primary/20 rounded-lg overflow-hidden py-2 px-4 shadow-sm">
        {/* eslint-disable-next-line jsx-a11y/no-distracting-elements */}
        <marquee className="text-sm font-semibold text-primary">
          Welcome back, {user?.name || 'User'}! • Email: {user?.email} • Last Login / Session Started: {new Date(session.iat ? session.iat * 1000 : Date.now()).toLocaleString()}
        </marquee>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="relative overflow-hidden p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              {/* Subtle background glow */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 opacity-20 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-40 ${stat.solidBg}`} />
              
              <div className="relative z-10 flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-1">{stat.name}</p>
                  <p className="text-3xl font-black text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>



      <div className="bg-card/50 backdrop-blur-md rounded-2xl border border-border/50 p-7 shadow-lg">
        <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full"></div>
          Documents Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {documentStats.map((doc) => {
            const Icon = doc.icon;
            return (
              <Link key={doc.name} href={doc.href} className="relative p-5 bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center hover:border-transparent transition-all duration-300 group hover:shadow-2xl hover:shadow-black/5 overflow-hidden">
                {/* Hover background fill */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${doc.solidBg}`} />
                
                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-border/50 ${doc.bg} group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}>
                  <Icon className={`w-6 h-6 ${doc.color}`} />
                </div>
                <p className="relative z-10 text-3xl font-bold text-foreground mb-1 group-hover:scale-105 transition-transform duration-300">{doc.value}</p>
                <p className="relative z-10 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300">{doc.name}</p>
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
