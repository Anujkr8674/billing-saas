"use client";

import React, { useEffect, useState } from "react";
import { getDashboardReports } from "@/app/actions/reports";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { Loader2, TrendingUp, DollarSign, FileText, ArrowDownRight, ArrowUpRight, BarChart3, PieChart as PieChartIcon, Users, Clock } from "lucide-react";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getDashboardReports();
        setData(result);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const STATUS_COLORS = ['#10b981', '#ef4444', '#f59e0b']; // Paid, Unpaid, Draft

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Financial & Document Reports
          </h1>
          <p className="text-gray-500 mt-1">Comprehensive overview of your business performance.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Invoiced" 
          value={formatCurrency(data.kpis.totalInvoiced)} 
          icon={<FileText className="w-5 h-5 text-blue-600" />}
          trend="+12%" trendUp={true}
          color="bg-blue-50"
        />
        <KPICard 
          title="Total Received" 
          value={formatCurrency(data.kpis.totalReceived)} 
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          trend="+8%" trendUp={true}
          color="bg-emerald-50"
        />
        <KPICard 
          title="Total Expenses" 
          value={formatCurrency(data.kpis.totalExpenses)} 
          icon={<ArrowDownRight className="w-5 h-5 text-rose-600" />}
          trend="-2%" trendUp={false}
          color="bg-rose-50"
        />
        <KPICard 
          title="Total Quotations" 
          value={formatCurrency(data.kpis.totalQuotations)} 
          icon={<ArrowUpRight className="w-5 h-5 text-amber-600" />}
          trend="+5%" trendUp={true}
          color="bg-amber-50"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Trend (Last 12 Months)</h2>
            <p className="text-sm text-gray-500">Invoiced vs Received amounts</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="invoiced" name="Invoiced" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorInvoiced)" />
                <Area type="monotone" dataKey="received" name="Received" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReceived)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Donut Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-gray-900">Invoice Status</h2>
            <p className="text-sm text-gray-500">Breakdown of invoices</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {data.invoiceStatuses.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.invoiceStatuses}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.invoiceStatuses.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm">No invoice data available</div>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-2 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Document Distribution</h2>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.documentDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  labelLine={true}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius * 1.4;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill="#6b7280" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} className="hidden sm:block">
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  stroke="none"
                >
                  {data.documentDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expenses Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Income vs Expenses</h2>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="received" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Top Clients */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Top Clients by Revenue</h2>
          </div>
          <div className="space-y-4">
            {data.topClients && data.topClients.length > 0 ? (
              data.topClients.map((client: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">{client.name}</span>
                  </div>
                  <span className="font-bold text-gray-700">{formatCurrency(client.amount)}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-4">No client data available</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {data.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((doc: any, i: number) => (
                <div key={i} className="flex flex-wrap items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      doc.type === 'Invoice' ? 'bg-blue-100 text-blue-700' :
                      doc.type === 'Quotation' ? 'bg-amber-100 text-amber-700' :
                      doc.type === 'Receipt' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {doc.type}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{doc.id}</span>
                      <span className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(doc.amount)}</span>
                    {doc.client !== 'N/A' && <span className="text-xs text-gray-500 truncate max-w-[100px]">{doc.client}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-4">No recent activity</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function KPICard({ title, value, icon, trend, trendUp, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {trend}
        </span>
        <span className="text-gray-400 ml-2">vs last month</span>
      </div>
    </div>
  );
}