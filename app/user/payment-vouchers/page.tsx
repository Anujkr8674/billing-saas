"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { getPaymentVouchers, deletePaymentVoucher } from "@/app/actions/documents";

const ITEMS_PER_PAGE = 10;

export default function PaymentVouchersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const list = await getPaymentVouchers();
    setData(list);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      await deletePaymentVoucher(id);
      fetchData();
    }
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const currentData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Payment Vouchers</h1>
          <p className="text-muted-foreground text-xs sm:text-sm truncate hidden sm:block">Manage your payment vouchers</p>
        </div>
        <Link 
          href="/user/payment-vouchers/new" 
          className="flex items-center gap-2 bg-[#5b21b6] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base hover:bg-[#5b21b6]/90 transition-colors shadow-sm font-medium w-fit"
        >
          <Plus className="w-5 h-5" /> Create Payment Voucher
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Payment Vouchers found</h3>
            <p className="text-muted-foreground mb-6">Create your first payment voucher to get started.</p>
            <Link 
              href="/user/payment-vouchers/new" 
              className="bg-[#f3e8ff] text-[#5b21b6] font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base hover:bg-[#e9d5ff] transition-colors"
            >
              Create New
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="py-4 px-6 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Doc #</th>
                    <th className="py-4 px-6 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Paid To</th>
                    <th className="py-4 px-6 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="py-4 px-6 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-center">Status</th>
                    <th className="py-4 px-6 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-center">PDF-VIEW</th>
                    <th className="py-4 px-6 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentData.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6">
                        <Link href={`/user/payment-vouchers/${item.id}/view`} className="font-semibold text-[#5b21b6] hover:underline">
                          {item.docNumber}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                      <td className="py-4 px-6 text-sm font-medium text-foreground">{item.paidTo}</td>
                      <td className="py-4 px-6 text-sm font-medium text-foreground">₹{(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#f3e8ff] text-[#5b21b6]">
                          {item.status || "Saved"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Link 
                          href={`/user/payment-vouchers/${item.id}/view`}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#e0e7ff] text-[#4338ca] hover:bg-[#c7d2fe] transition-colors rounded-lg text-sm font-semibold shadow-sm"
                        >
                          <Eye className="w-4 h-4" /> View
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/user/payment-vouchers/${item.id}`}
                            className="p-2 text-muted-foreground hover:text-[#5b21b6] hover:bg-[#f3e8ff] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/10">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{data.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, data.length)}</span> of <span className="font-medium text-foreground">{data.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-border rounded-lg hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-card shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium px-4 py-2 bg-card border border-border rounded-lg shadow-sm">
                  {currentPage} / {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.max(1, totalPages), p + 1))}
                  disabled={currentPage >= Math.max(1, totalPages)}
                  className="p-2 border border-border rounded-lg hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-card shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}