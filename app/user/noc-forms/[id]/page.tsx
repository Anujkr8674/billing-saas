"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ChevronDown, Send, FileText } from "lucide-react";
import { getNOCFormById, updateNOCForm } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { sendNOCEmail } from "@/app/actions/email"; // To be created
import { toast } from "sonner";

export default function EditNOCFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionType, setActionType] = useState<"save" | "send">("save");
  const actionTypeRef = useRef<"save" | "send">("save");
  const [userProfile, setUserProfile] = useState<any>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    lrReference: true,
    partyDetails: true,
    routeDetails: true,
    nocDetails: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    getUserProfile().then(res => setUserProfile(res));
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      lrNo: "",
      lrDate: "",
      clientName: "",
      phone: "",
      email: "",
      fromCity: "",
      toCity: "",
      nocType: "NOC for Goods Transfer",
      notes: ""
    }
  });

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const item = await getNOCFormById(id);
        if (item) {
          const d: any = item.details || {};
          reset({
            date: new Date(item.date).toISOString().split("T")[0],
            lrNo: d.lrNo || "",
            lrDate: d.lrDate || "",
            clientName: item.clientName || "",
            phone: d.phone || "",
            email: d.email || "",
            fromCity: d.fromCity || "",
            toCity: d.toCity || "",
            nocType: d.nocType || "NOC for Goods Transfer",
            notes: d.notes || ""
          });
        }
      } catch (err: any) {
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        clientName: data.clientName,
        date: new Date(data.date),
        details: {
          lrNo: data.lrNo,
          lrDate: data.lrDate,
          phone: data.phone,
          email: data.email,
          fromCity: data.fromCity,
          toCity: data.toCity,
          nocType: data.nocType,
          notes: data.notes
        }
      };

      await updateNOCForm(id, payload);
      toast.success("NOC Form updated successfully!");
      
      if (actionTypeRef.current === "send") {
        let targetEmail = data.email;
        if (!targetEmail) {
          targetEmail = prompt("Please enter recipient email address:");
        }
        if (targetEmail) {
          toast.loading("Sending email...", { id: "email-toast" });
          try {
            const result = await getNOCFormById(id);
            const safeResult = JSON.parse(JSON.stringify(result));
            const safeProfile = JSON.parse(JSON.stringify(userProfile));
            await sendNOCEmail(safeResult, safeProfile, targetEmail);
            toast.success("Email sent successfully!", { id: "email-toast" });
          } catch (e: any) {
            toast.error(e.message || "Failed to send email", { id: "email-toast" });
          }
        } else {
          toast.error("Email was not sent because no address was provided.");
        }
      }

      router.push("/user/noc-forms");
    } catch (error: any) {
      toast.error(error.message || "Failed to update NOC Form");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit NOC Form</h1>
        </div>
      </div>

      <form className="space-y-6" id="noc-form">
        {/* LR / Bilty Reference Box */}
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("lrReference")}
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <h2 className="font-bold text-sm text-foreground">LR / Bilty Reference</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.lrReference ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.lrReference && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">NOC Date *</label>
                <input 
                  type="date" 
                  {...register("date", { required: true })} 
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">LR No.</label>
                <input 
                  type="text" 
                  placeholder="e.g. LR-2026-001"
                  {...register("lrNo")} 
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">LR Date</label>
                <input 
                  type="date" 
                  {...register("lrDate")} 
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                />
              </div>
            </div>
          )}
        </div>

        {/* Party Details Box */}
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("partyDetails")}
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <h2 className="font-bold text-sm text-foreground">Party Details</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.partyDetails ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.partyDetails && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Customer / Consignor name"
                  {...register("clientName", { required: true })} 
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Phone *</label>
                <input 
                  type="text" 
                  placeholder="+91 XXXXX XXXXX"
                  {...register("phone", { required: true })} 
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="optional@email.com"
                  {...register("email")} 
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                />
              </div>
            </div>
          )}
        </div>

        {/* Route Details Box */}
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("routeDetails")}
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <h2 className="font-bold text-sm text-foreground">Route Details</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.routeDetails ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.routeDetails && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">From City *</label>
                <input 
                  type="text" 
                  placeholder="Origin city"
                  {...register("fromCity", { required: true })} 
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">To City *</label>
                <input 
                  type="text" 
                  placeholder="Destination city"
                  {...register("toCity", { required: true })} 
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                />
              </div>
            </div>
          )}
        </div>

        {/* NOC Details Box */}
        <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("nocDetails")}
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
          >
            <h2 className="font-bold text-sm text-foreground">NOC Details</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.nocDetails ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.nocDetails && (
            <div className="p-4 border-t border-border space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">NOC Type *</label>
                <select 
                  {...register("nocType", { required: true })} 
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                >
                  <option value="NOC for Goods Transfer">NOC for Goods Transfer</option>
                  <option value="NOC for Vehicle Release">NOC for Vehicle Release</option>
                  <option value="NOC for Payment Settlement">NOC for Payment Settlement</option>
                  <option value="General NOC">General NOC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Notes / Remarks</label>
                <textarea 
                  {...register("notes")} 
                  rows={3}
                  placeholder="Any additional notes or conditions..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b21b6] bg-background"
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Action Bar */}
      <div className="mt-8 bg-card border border-border rounded-lg p-4 px-8 flex justify-between items-center shadow-sm">
        <button 
          onClick={() => router.push("/user/noc-forms")} 
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-200 focus:outline-none"
          disabled={saving}
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => {
              actionTypeRef.current = "save";
              setActionType("save");
              handleSubmit(onSubmit)();
            }}
            disabled={saving}
            className="px-6 py-2 bg-[#f3e8ff] text-[#5b21b6] font-medium rounded-lg hover:bg-[#e9d5ff] transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {saving && actionType === "save" ? "Saving..." : "Save Updates"}
          </button>
          <button 
            type="button"
            onClick={() => {
              actionTypeRef.current = "send";
              setActionType("send");
              handleSubmit(onSubmit)();
            }}
            disabled={saving}
            className="px-6 py-2 bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            {saving && actionType === "send" ? "Processing..." : "Submit & Send PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}