"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getInvoiceById, updateInvoice } from "@/app/actions/invoices";

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    getInvoiceById(id).then(data => {
      if (data) {
        setClientName(data.clientName || "");
        setAmount((data.totalAmount || (data as any).amount || 0).toString());
        setStatus(data.status);
        setOriginalData(data);
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    await updateInvoice(id, {
      clientName,
      totalAmount: amount,
      status,
      date: originalData?.date || new Date(),
      details: originalData?.details || []
    });
    router.push("/user/invoices");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Edit Invoice</h1>
        <button 
          onClick={() => router.push("/user/invoices")} 
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-200 focus:outline-none"
        >
          Cancel
        </button>
      </div>
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Client Name</label>
            <input required value={clientName} onChange={e=>setClientName(e.target.value)} type="text" className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Amount (₹)</label>
            <input required value={amount} onChange={e=>setAmount(e.target.value)} type="number" className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <button disabled={saving} type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Update Document"}
          </button>
        </form>
      </div>
    </div>
  );
}
