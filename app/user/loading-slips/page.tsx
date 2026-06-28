"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { getLoadingSlips, deleteLoadingSlip } from "@/app/actions/documents";

export default function LoadingSlipsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    setLoading(true);
    const res = await getLoadingSlips();
    setData(res);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this loading slip?")) {
      await deleteLoadingSlip(id);
      loadData();
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Loading Slips {data.length > 0 && `(${data.length})`}</h1>
        <Link href="/user/loading-slips/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Create New
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border uppercase">
                <th className="py-4 px-6 font-semibold text-xs tracking-wider text-muted-foreground">DOC #</th>
                <th className="py-4 px-6 font-semibold text-xs tracking-wider text-muted-foreground">DATE</th>
                <th className="py-4 px-6 font-semibold text-xs tracking-wider text-muted-foreground">OWNER / ROUTE</th>
                <th className="py-4 px-6 font-semibold text-xs tracking-wider text-muted-foreground">VEHICLE / DRIVER</th>
                <th className="py-4 px-6 font-semibold text-xs tracking-wider text-muted-foreground text-center">PDF-VIEW</th>
                <th className="py-4 px-6 font-semibold text-xs tracking-wider text-muted-foreground text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No documents found. Create one!</td></tr>
              ) : currentData.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-primary">
                    <Link href={`/user/loading-slips/${item.id}/view`} className="hover:underline">
                      {item.docNumber}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                  <td className="py-4 px-6 text-sm">
                    <div className="font-bold text-foreground">{item.details?.ownerName || "N/A"}</div>
                    <div className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                      {item.details?.fromCity || "N/A"} <span className="text-muted-foreground">→</span> {item.details?.toCity || "N/A"}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <div className="font-bold text-foreground">{item.vehicleNo || item.details?.vehicleNo || "N/A"}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{item.driverName || item.details?.driverName || "N/A"}</div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Link href={`/user/loading-slips/${item.id}/view`} className="inline-flex items-center justify-center px-3 py-1.5 bg-[#e0e7ff] text-[#4338ca] hover:bg-[#c7d2fe] transition-colors rounded-md text-sm font-semibold whitespace-nowrap" title="View PDF">
                      <Eye className="w-4 h-4 mr-1.5" /> View
                    </Link>
                  </td>
                  <td className="py-4 px-6 flex items-center justify-end gap-4">
                    <Link href={`/user/loading-slips/${item.id}`} className="text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(item.id)} className="text-danger hover:text-danger/80 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, data.length)}</span> of <span className="font-medium text-foreground">{data.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 border border-border rounded-lg bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 border border-border rounded-lg bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}