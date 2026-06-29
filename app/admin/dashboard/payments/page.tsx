import { CreditCard } from "lucide-react";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card py-3 px-4 sm:py-4 sm:px-6 rounded-xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-danger" />
            Payments History
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">View all platform payments and transactions.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
         <CreditCard className="w-16 h-16 text-muted-foreground/30 mb-4" />
         <h2 className="text-xl font-bold text-foreground mb-2">Coming Soon</h2>
         <p className="text-muted-foreground max-w-md">The detailed payment history and management interface is currently under development.</p>
      </div>
    </div>
  );
}
