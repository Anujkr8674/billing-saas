"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ChevronDown, Send, FileText } from "lucide-react";
import { getPaymentVoucherById, updatePaymentVoucher } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { sendPaymentVoucherEmail } from "@/app/actions/email";
import { toast } from "sonner";

export default function EditPaymentVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionType, setActionType] = useState<"save" | "send">("save");
  const actionTypeRef = useRef<"save" | "send">("save");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    getUserProfile().then(res => setUserProfile(res));
  }, []);
  
  const [openSections, setOpenSections] = useState({
    payeeDetails: true,
    paymentDetails: true,
    notes: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      paidTo: "",
      phone: "",
      email: "",
      date: new Date().toISOString().split("T")[0],
      approvedBy: "",
      amount: "",
      paymentMode: "Cash",
      referenceNo: "",
      purpose: "",
      notes: ""
    }
  });

  useEffect(() => {
    getPaymentVoucherById(id).then(data => {
      if (data) {
        const d = data.details as any || {};
        reset({
          paidTo: data.paidTo || "",
          phone: d.phone || "",
          email: d.email || "",
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          approvedBy: d.approvedBy || "",
          amount: data.amount ? data.amount.toString() : "",
          paymentMode: d.paymentMode || "Cash",
          referenceNo: d.referenceNo || "",
          purpose: d.purpose || "",
          notes: d.notes || ""
        });
      }
      setLoading(false);
    });
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const details = {
        phone: data.phone,
        email: data.email,
        approvedBy: data.approvedBy,
        paymentMode: data.paymentMode,
        referenceNo: data.referenceNo,
        purpose: data.purpose,
        notes: data.notes
      };

      await updatePaymentVoucher(id, {
        paidTo: data.paidTo,
        amount: parseFloat(data.amount) || 0,
        date: new Date(data.date),
        details
      });

      toast.success("Payment Voucher updated successfully!");
      
      if (actionTypeRef.current === "send") {
        let targetEmail = data.email;
        if (!targetEmail) {
          targetEmail = prompt("Please enter recipient email address:");
        }
        if (targetEmail) {
          toast.loading("Sending email...", { id: "email-toast" });
          try {
            const result = await getPaymentVoucherById(id);
            const safeResult = JSON.parse(JSON.stringify(result));
            const safeProfile = JSON.parse(JSON.stringify(userProfile));
            await sendPaymentVoucherEmail(safeResult, safeProfile, targetEmail);
            toast.success("Email sent successfully!", { id: "email-toast" });
          } catch (e: any) {
            toast.error(e.message || "Failed to send email", { id: "email-toast" });
          }
        } else {
          toast.error("Email was not sent because no address was provided.");
        }
      }
      
      router.push("/user/payment-vouchers");
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment voucher");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
<div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Edit Payment Voucher</h1>
        <button 
          type="button"
          onClick={() => router.push("/user/payment-vouchers")} 
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-100 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          Cancel
        </button>
      </div>

      <form id="voucher-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Payee Details */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("payeeDetails")}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <h2 className="text-sm font-bold text-foreground">Payee Details</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.payeeDetails ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.payeeDetails && (
            <div className="p-4 border-t border-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Paid To *</label>
                  <input
                    {...register("paidTo", { required: "Payee Name is required" })}
                    placeholder="Name of person / vendor"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  />
                  {errors.paidTo && <p className="text-red-500 text-xs mt-1">{errors.paidTo.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Phone / WhatsApp</label>
                  <input
                    {...register("phone")}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="optional@email.com"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Date *</label>
                  <input
                    type="date"
                    {...register("date", { required: "Date is required" })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Approved By</label>
                  <input
                    {...register("approvedBy")}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("paymentDetails")}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <h2 className="text-sm font-bold text-foreground">Payment Details</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.paymentDetails ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.paymentDetails && (
            <div className="p-4 border-t border-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("amount", { required: "Amount is required" })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Payment Mode *</label>
                  <select
                    {...register("paymentMode")}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Reference / Cheque / UTR No.</label>
                  <input
                    {...register("referenceNo")}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Purpose *</label>
                  <input
                    {...register("purpose", { required: "Purpose is required" })}
                    placeholder="e.g. Labour charges for packing on 01-04-2026"
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]"
                  />
                  {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message as string}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("notes")}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <h2 className="text-sm font-bold text-foreground">Notes</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.notes ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.notes && (
            <div className="p-4 border-t border-border">
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6] resize-y"
              />
            </div>
          )}
        </div>
      </form>

      {/* Action Buttons */}
      <div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-row overflow-x-auto justify-between items-center mt-6 gap-4">
        <div className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap shrink-0">
          <span className="text-muted-foreground/60">Ready to save</span>
        </div>
        <div className="flex flex-row justify-end gap-2 sm:gap-3 shrink-0">
        <button
          type="submit"
          form="voucher-form"
          disabled={saving}
          onClick={() => {
            actionTypeRef.current = "save";
            setActionType("save");
          }}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-[#f3e8ff] text-[#5b21b6] font-medium rounded-lg hover:bg-[#e9d5ff] transition-colors disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          {saving && actionType === "save" ? "Saving..." : "Save Updates"}
        </button>
        <button
          type="submit"
          form="voucher-form"
          disabled={saving}
          onClick={() => {
            actionTypeRef.current = "send";
            setActionType("send");
          }}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Send className="w-4 h-4" />
          {saving && actionType === "send" ? "Processing..." : "Submit & Send PDF"}
        </button>
      </div>
    </div>
</div>
  );
}