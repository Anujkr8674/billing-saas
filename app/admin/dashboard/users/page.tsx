import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      subscription: {
        include: {
          plan: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card py-3 px-4 sm:py-4 sm:px-6 rounded-xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Manage Users
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">View and manage all registered users.</p>
        </div>
        
        <div className="relative">
           <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
           <input 
             type="text"
             placeholder="Search users..."
             className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
           />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">User Name</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">Email</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">Mobile</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">Joined Date</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">Plan</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                <th className="py-3 px-4 font-medium text-sm text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const planName = user.subscription?.plan?.name || "No Plan";
                const isTrial = planName.toLowerCase().includes("trial");
                const isActive = user.subscription?.isActive;

                return (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{user.mobile}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{user.createdAt.toLocaleDateString()}</td>
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
                    <td className="py-3 px-4 text-sm text-right">
                       <Link href={`/admin/dashboard/users/${user.id}`} className="text-primary font-medium hover:underline">
                         View Details
                       </Link>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                    No users found.
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
