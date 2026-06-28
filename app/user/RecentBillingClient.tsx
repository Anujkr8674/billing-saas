"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

type RecentDoc = {
  id: string;
  docNumber: string;
  createdAt: Date;
  type: string;
  typeSlug: string;
  label: string;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Survey': return 'bg-blue-500/10 text-blue-500';
    case 'Quotation': return 'bg-purple-500/10 text-purple-500';
    case 'Invoice': return 'bg-green-500/10 text-green-500';
    case 'Loading Slip': return 'bg-orange-500/10 text-orange-500';
    case 'Lorry Receipt': return 'bg-indigo-500/10 text-indigo-500';
    case 'Packing List': return 'bg-pink-500/10 text-pink-500';
    case 'Payment Voucher': return 'bg-teal-500/10 text-teal-500';
    case 'Money Receipt': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500';
    case 'Vehicle Condition': return 'bg-cyan-500/10 text-cyan-500';
    case 'NOC Form': return 'bg-rose-500/10 text-rose-500';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

export default function RecentBillingClient({ data }: { data: RecentDoc[] }) {
  const router = useRouter();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const handleRowClick = (item: RecentDoc) => {
    setHighlightedId(item.id);
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedId(null);
    }, 3000);

    // Redirect to the respective view (PDF view) page
    router.push(`/user/${item.typeSlug}/${item.id}/view`);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="p-4 border-b border-border bg-muted/20">
        <h2 className="text-lg font-bold text-foreground">Recent Billing (Last 7 Days)</h2>
        <p className="text-xs text-muted-foreground mt-1">Showing latest activity. Click on any row to view its data/PDF.</p>
      </div>
      
      {/* Container with max height for showing approx 5 rows, the rest scrollable */}
      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '350px' }}>
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-card z-10 shadow-sm">
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-6 font-semibold">Document No.</th>
              <th className="py-3 px-6 font-semibold">Type</th>
              <th className="py-3 px-6 font-semibold">Customer / Ref</th>
              <th className="py-3 px-6 font-semibold text-right">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">No recent billing activity found in the last 7 days.</td>
              </tr>
            ) : (
              data.map((item) => {
                const isHighlighted = highlightedId === item.id;
                
                return (
                  <tr 
                    key={item.id} 
                    onClick={() => handleRowClick(item)}
                    className={`border-b border-border cursor-pointer transition-colors duration-300 ${
                      isHighlighted 
                        ? 'bg-primary/20 hover:bg-primary/30' // Highlight color
                        : 'hover:bg-muted/50' 
                    }`}
                  >
                    <td className="py-4 px-6 text-sm font-medium text-primary">
                      {item.docNumber}
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground font-medium">
                      {item.label}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground text-right">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
