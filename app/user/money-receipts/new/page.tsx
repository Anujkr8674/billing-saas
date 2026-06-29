"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ChevronDown, Send, FileText } from "lucide-react";
import { createMoneyReceipt } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { sendMoneyReceiptEmail } from "@/app/actions/email";
import { useAlert } from "@/components/providers/AlertModalProvider";

// Utility to convert numbers to words
const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = "";
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0] as any] + " " + a[n[1][1] as any]) + "Crore " : "";
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0] as any] + " " + a[n[2][1] as any]) + "Lakh " : "";
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0] as any] + " " + a[n[3][1] as any]) + "Thousand " : "";
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0] as any] + " " + a[n[4][1] as any]) + "Hundred " : "";
  str += (Number(n[5]) !== 0) ? ((str !== "") ? "and " : "") + (a[Number(n[5])] || b[n[5][0] as any] + " " + a[n[5][1] as any]) : "";
  return str.trim() + " Only";
};

export default function NewMoneyReceiptPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<"save" | "send">("save");
  const actionTypeRef = useRef<"save" | "send">("save");
  const [userProfile, setUserProfile] = useState<any>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    receiptDetails: true,
    paymentDetails: true,
    notes: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    getUserProfile().then(res => setUserProfile(res));
  }, []);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      receivedFrom: "",
      phone: "",
      email: "",
      againstDocument: "",
      amount: "0",
      amountInWords: "Zero",
      paymentMode: "Cash",
      notes: ""
    }
  });

  const amount = watch("amount");

  useEffect(() => {
    const num = parseFloat(amount || "0");
    if (!isNaN(num)) {
      setValue("amountInWords", numberToWords(Math.floor(num)));
    }
  }, [amount, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const result = await createMoneyReceipt(data);
      if (actionTypeRef.current === "send") {
        let targetEmail = data.email;
        if (!targetEmail) {
          targetEmail = prompt("Please enter recipient email address:");
        }
        if (targetEmail) {
          try {
            const safeResult = JSON.parse(JSON.stringify(result));
            const safeProfile = JSON.parse(JSON.stringify(userProfile));
            await sendMoneyReceiptEmail(safeResult, safeProfile, targetEmail);
            showAlert("success", "Money Receipt created and emailed successfully!");
          } catch (e: any) {
            showAlert("error", e.message || "Failed to send email");
          }
        } else {
          showAlert("error", "Email was not sent because no address was provided.");
        }
      } else {
        showAlert("success", "Money Receipt created successfully!");
      }
      
      router.push("/user/money-receipts");
    } catch (error: any) {
      showAlert("error", error.message || "Failed to create money receipt");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
<div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Create Money Receipt</h1>
        <button 
          type="button"
          onClick={() => router.push("/user/money-receipts")} 
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-100 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          Cancel
        </button>
      </div>

      <form className="space-y-6" id="mr-form">

        {/* Receipt Details Box */}
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("receiptDetails")}
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <h2 className="font-bold text-sm text-foreground">Receipt Details</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.receiptDetails ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.receiptDetails && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date *</label>
              <input 
                type="date" 
                {...register("date", { required: true })} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Received From (Name) *</label>
              <input 
                type="text" 
                {...register("receivedFrom", { required: true })} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone / WhatsApp *</label>
              <input 
                type="text" 
                {...register("phone", { required: true })} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input 
                type="email" 
                placeholder="customer@email.com"
                {...register("email")} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Against Document</label>
              <input 
                type="text" 
                placeholder="e.g. Invoice #INV-0001"
                {...register("againstDocument")} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
              />
            </div>
          </div>
          )}
        </div>

        {/* Payment Details Box */}
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("paymentDetails")}
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <h2 className="font-bold text-sm text-foreground">Payment Details</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.paymentDetails ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.paymentDetails && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Amount (Rs.) *</label>
              <input 
                type="number" 
                step="0.01"
                {...register("amount", { required: true, min: 0 })} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Payment Mode *</label>
              <select 
                {...register("paymentMode")} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
              >
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Online Transfer">Online Transfer</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Amount in Words</label>
              <input 
                type="text" 
                {...register("amountInWords")} 
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-muted/50 text-muted-foreground italic"
                readOnly
              />
            </div>
          </div>
          )}
        </div>

        {/* Notes Box */}
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("notes")}
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <h2 className="font-bold text-sm text-foreground">Notes</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.notes ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.notes && (
            <div className="p-4 border-t border-border">
            <textarea 
              {...register("notes")} 
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
            />
          </div>
          )}
        </div>
      </form>

      {/* Action Bar */}
      <div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-row overflow-x-auto justify-between items-center mt-6 gap-4">
        <div className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap shrink-0">
          <span className="text-muted-foreground/60">Ready to save</span>
        </div>
        <div className="flex flex-row justify-end gap-2 sm:gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => {
              actionTypeRef.current = "save";
              setActionType("save");
              handleSubmit(onSubmit)();
            }}
            disabled={loading}
            className="px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-[#f3e8ff] text-[#5b21b6] font-medium rounded-lg hover:bg-[#e9d5ff] transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {loading && actionType === "save" ? "Saving..." : "Save Updates"}
          </button>
          <button 
            type="button"
            onClick={() => {
              actionTypeRef.current = "send";
              setActionType("send");
              handleSubmit(onSubmit)();
            }}
            disabled={loading}
            className="px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            {loading && actionType === "send" ? "Processing..." : "Submit & Send PDF"}
          </button>
        </div>
      </div>
</div>
  );
}