"use client";

import { useState, useEffect } from "react";
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { format, subDays } from "date-fns";
import { Calendar } from "lucide-react";

type DashboardStats = {
  billingData: { name: string; value: number; fill: string }[];
  paymentData: { name: string; value: number; fill: string }[];
  turnoverData: { date: string; inflow: number; outflow: number }[];
  summary: { totalInflow: number; totalOutflow: number; totalBilled: number };
};

export default function DashboardCharts() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Default to last 30 days
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/dashboard-stats?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border shadow-md rounded-lg">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-sm font-medium" style={{ color: p.color || p.fill }}>
              {p.name}: ₹{p.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Filters Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm gap-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Financial Overview
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">From:</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none w-full sm:w-auto"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">To:</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {loading && !stats ? (
        <div className="h-64 flex items-center justify-center bg-card rounded-xl border border-border shadow-sm">
          <p className="text-muted-foreground animate-pulse">Loading charts...</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 w-full">
          
          {/* Turnover Area Chart */}
          <div className="col-span-1 lg:col-span-2 bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm min-w-0 overflow-hidden">
            <h3 className="text-base font-bold text-foreground mb-4">Turnover Overview</h3>
            {stats.turnoverData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No turnover data in this period.</p>
              </div>
            ) : (
              <div className="h-[300px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.turnoverData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="inflow" name="Inflow (Receipts)" stroke="#eab308" fillOpacity={1} fill="url(#colorInflow)" />
                    <Area type="monotone" dataKey="outflow" name="Outflow (Vouchers)" stroke="#14b8a6" fillOpacity={1} fill="url(#colorOutflow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Billing Pie Chart */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm flex flex-col min-w-0 overflow-hidden">
            <h3 className="text-base font-bold text-foreground mb-4">Billing Overview</h3>
            {stats.billingData.every(d => d.value === 0) ? (
              <div className="flex-1 flex items-center justify-center min-h-[250px]">
                <p className="text-muted-foreground">No billing data in this period.</p>
              </div>
            ) : (
              <div className="h-[250px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.billingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.billingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Payment Pie Chart */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm flex flex-col min-w-0 overflow-hidden">
            <h3 className="text-base font-bold text-foreground mb-4">Payment Overview</h3>
            {stats.paymentData.every(d => d.value === 0) ? (
              <div className="flex-1 flex items-center justify-center min-h-[250px]">
                <p className="text-muted-foreground">No payment data in this period.</p>
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      ) : null}
    </div>
  );
}
