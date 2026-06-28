"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getLorryReceiptById, updateLorryReceipt } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { useAlert } from "@/components/providers/AlertModalProvider";

function Accordion({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden mb-6 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
      >
        <span className="font-bold text-sm text-foreground">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {isOpen && <div className="p-4 border-t border-border bg-card">{children}</div>}
    </div>
  );
}

export default function EditLorryReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      consignorName: "",
      consignorPhone: "",
      consignorEmail: "",
      consignorAddress: "",
      consignorGST: "",

      consigneeName: "",
      consigneePhone: "",
      consigneeAddress: "",
      consigneeGST: "",

      date: new Date().toISOString().split('T')[0],
      fromCity: "",
      toCity: "",
      vehicleNo: "",
      driverName: "",
      driverPhone: "",

      description: "",
      packages: 1,
      weight: "",
      declaredValue: 0,
      privateMarks: "",
      deliveryType: "Door Delivery",
      paymentTerms: "To Pay",

      freight: 0,
      lrCharges: 0,
      loadingCharge: 0,
      unloadingCharge: 0,
      otherCharge: 0,
      totalCharges: 0,

      notes: ""
    }
  });

  const freight = watch("freight");
  const lrCharges = watch("lrCharges");
  const loadingCharge = watch("loadingCharge");
  const unloadingCharge = watch("unloadingCharge");
  const otherCharge = watch("otherCharge");

  useEffect(() => {
    getUserProfile().then(data => {
      if (data) setUserProfile(data);
    });
    
    getLorryReceiptById(id).then(data => {
      if (data) {
        const d: any = data.details || {};
        reset({
          consignorName: d.consignorName || data.consignor || "",
          consignorPhone: d.consignorPhone || "",
          consignorEmail: d.consignorEmail || "",
          consignorAddress: d.consignorAddress || "",
          consignorGST: d.consignorGST || "",

          consigneeName: d.consigneeName || data.consignee || "",
          consigneePhone: d.consigneePhone || "",
          consigneeAddress: d.consigneeAddress || "",
          consigneeGST: d.consigneeGST || "",

          date: new Date(data.date).toISOString().split('T')[0],
          fromCity: d.fromCity || "",
          toCity: d.toCity || "",
          vehicleNo: d.vehicleNo || "",
          driverName: d.driverName || "",
          driverPhone: d.driverPhone || "",

          description: d.description || "",
          packages: d.packages || 1,
          weight: d.weight || "",
          declaredValue: d.declaredValue || 0,
          privateMarks: d.privateMarks || "",
          deliveryType: d.deliveryType || "Door Delivery",
          paymentTerms: d.paymentTerms || "To Pay",

          freight: d.freight || 0,
          lrCharges: d.lrCharges || 0,
          loadingCharge: d.loadingCharge || 0,
          unloadingCharge: d.unloadingCharge || 0,
          otherCharge: d.otherCharge || 0,
          totalCharges: d.totalCharges || 0,

          notes: d.notes || ""
        });
      }
      setPageLoading(false);
    });
  }, [id, reset]);

  // Compute Total Charges automatically
  useEffect(() => {
    const total = Number(freight) + Number(lrCharges) + Number(loadingCharge) + Number(unloadingCharge) + Number(otherCharge);
    setValue("totalCharges", total);
  }, [freight, lrCharges, loadingCharge, unloadingCharge, otherCharge, setValue]);

  const onSave = async (data: any, actionType: 'submit' | 'send' = 'submit') => {
    setSaving(true);
    try {
      const result = await updateLorryReceipt(id, {
        consignor: data.consignorName,
        consignee: data.consigneeName,
        date: new Date(data.date),
        details: data
      });
      
      if (actionType === 'send') {
        const { sendLorryReceiptEmail } = await import("@/app/actions/email");
        let targetEmail = data.consignorEmail;
        if (!targetEmail) {
          targetEmail = prompt("Please enter recipient email address:");
        }
        if (targetEmail) {
          await sendLorryReceiptEmail(result, userProfile, targetEmail);
          showAlert("success", "Lorry Receipt updated and emailed successfully!");
        } else {
          showAlert("error", "Email was not sent because no address was provided.");
        }
      }
      
      router.push("/user/lorry-receipts");
    } catch (err: any) {
      showAlert("error", err.message || "Failed to update lorry receipt");
    }
    setSaving(false);
  };

  if (pageLoading) return <div className="p-8 text-center text-muted-foreground">Loading Document...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit LR / Bilty</h1>
        </div>
        <button 
          onClick={() => router.push("/user/lorry-receipts")} 
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-200 focus:outline-none"
        >
          Cancel
        </button>
      </div>

      <form className="space-y-2">

        <Accordion title="Consignor (Sender)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
              <input required {...register("consignorName")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone / WhatsApp *</label>
              <input required {...register("consignorPhone")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input {...register("consignorEmail")} placeholder="optional@email.com" type="email" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
              <input {...register("consignorAddress")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">GSTIN</label>
              <input {...register("consignorGST")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Consignee (Receiver)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
              <input required {...register("consigneeName")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone *</label>
              <input required {...register("consigneePhone")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
              <input {...register("consigneeAddress")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">GSTIN</label>
              <input {...register("consigneeGST")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Route & Transport">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date *</label>
              <input required {...register("date")} type="date" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">From *</label>
              <input required {...register("fromCity")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">To *</label>
              <input required {...register("toCity")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vehicle No. *</label>
              <input required {...register("vehicleNo")} placeholder="JH 01 AB 1234" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Driver Name</label>
              <input {...register("driverName")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Driver Phone</label>
              <input {...register("driverPhone")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Goods Details">
          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description of Goods *</label>
            <textarea required {...register("description")} rows={2} placeholder="Household goods, furniture, etc." className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">No. of Packages *</label>
              <input required {...register("packages")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Weight (approx)</label>
              <input {...register("weight")} placeholder="e.g. 500 kg" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Declared Value (Rs.)</label>
              <input {...register("declaredValue")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Private Marks</label>
              <input {...register("privateMarks")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Delivery Type</label>
              <select {...register("deliveryType")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="Door Delivery">Door Delivery</option>
                <option value="Godown Delivery">Godown Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Payment Terms</label>
              <select {...register("paymentTerms")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="To Pay">To Pay</option>
                <option value="Paid">Paid</option>
                <option value="To Be Billed">To Be Billed</option>
              </select>
            </div>
          </div>
        </Accordion>

        <Accordion title="Charges">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Freight</label>
              <input {...register("freight")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">LR Charges</label>
              <input {...register("lrCharges")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Loading</label>
              <input {...register("loadingCharge")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Unloading</label>
              <input {...register("unloadingCharge")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Other</label>
              <input {...register("otherCharge")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="mt-4 flex justify-end text-sm text-muted-foreground items-center gap-2">
            <span>Total Charges:</span>
            <span className="text-xl font-bold text-[#2563eb]">
              {Number(watch("totalCharges") || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
            </span>
          </div>
        </Accordion>

        <Accordion title="Notes" defaultOpen={false}>
          <div>
            <textarea {...register("notes")} rows={3} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y" placeholder="Add any additional notes here..."></textarea>
          </div>
        </Accordion>

        {/* Action Buttons */}
        <div className="bg-card p-4 border border-border rounded-xl shadow-sm flex justify-end items-center mt-6">
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={handleSubmit((data) => onSave(data, 'submit'))}
              disabled={saving}
              className="px-6 py-2 bg-[#f3e8ff] text-[#5b21b6] font-semibold rounded-lg hover:bg-[#e9d5ff] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Submit"}
            </button>
            <button 
              type="button"
              onClick={handleSubmit((data) => onSave(data, 'send'))}
              disabled={saving}
              className="px-6 py-2 bg-[#5b21b6] text-white font-semibold rounded-lg hover:bg-[#5b21b6]/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {saving ? "Saving..." : "Submit & Send PDF"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}