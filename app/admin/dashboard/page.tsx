import { Users, UserPlus, CreditCard, Activity } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const totalUsers = await prisma.user.count();
  
  const trialUsers = await prisma.userSubscription.count({
    where: {
      plan: { name: { contains: "Trial", mode: "insensitive" } },
      isActive: true,
    }
  });

  const paidUsers = await prisma.userSubscription.count({
    where: {
      plan: { 
        isNot: { 
          name: { contains: "Trial", mode: "insensitive" } 
        } 
      },
      isActive: true,
    }
  });

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const revenueResult = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "SUCCESS",
      createdAt: { gte: startOfMonth }
    }
  });
  const revenue = revenueResult._sum.amount || 0;

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      subscription: {
        include: {
          plan: true
        }
      }
    }
  });

  const stats = [
    { name: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { name: "Trial Users", value: trialUsers.toLocaleString(), icon: UserPlus, color: "text-warning", bg: "bg-warning/10" },
    { name: "Paid Users", value: paidUsers.toLocaleString(), icon: Activity, color: "text-success", bg: "bg-success/10" },
    { name: "Revenue (MTD)", value: `₹${revenue.toLocaleString('en-IN')}`, icon: CreditCard, color: "text-danger", bg: "bg-danger/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-foreground">Recent Registrations</h2>
          <Link href="/admin/dashboard/users" className="text-sm text-primary hover:underline font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">User Name</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">Email</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">Plan</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => {
                const planName = user.subscription?.plan?.name || "No Plan";
                const isTrial = planName.toLowerCase().includes("trial");
                const isActive = user.subscription?.isActive;

                return (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${isTrial ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                        {planName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-primary font-medium hover:underline cursor-pointer">
                      <Link href={`/admin/dashboard/users/${user.id}`}>Manage</Link>
                    </td>
                  </tr>
                );
              })}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                    No users registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
