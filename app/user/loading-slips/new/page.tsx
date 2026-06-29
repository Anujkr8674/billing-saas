"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { createLoadingSlip } from "@/app/actions/documents";
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

export default function NewLoadingSlipPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      ownerName: "",
      phone: "",
      email: "",
      pan: "",
      companyName: "",
      date: new Date().toISOString().split('T')[0],
      
      vehicleNo: "",
      vehicleSize: "",
      fromCity: "",
      toCity: "",
      
      driverName: "",
      driverMobile: "",
      driverLicence: "",
      
      weight: "",
      rate: "",
      freight: 0,
      advance: 0,
      balance: 0,
      guarantee: "",
      
      items: [
        { name: "", quantity: 1, condition: "Good", remark: "" }
      ],
      
      detentionCharge: 0,
      detentionType: "",
      detentionRemark: "",
      notes: ""
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    getUserProfile().then(data => {
      if (data) setUserProfile(data);
    });
  }, []);

  const onSave = async (data: any, actionType: 'submit' | 'send' = 'submit') => {
    setSaving(true);
    try {
      const result = await createLoadingSlip({
        vehicleNo: data.vehicleNo,
        driverName: data.driverName,
        date: new Date(data.date),
        details: data
      });
      
      if (actionType === 'send') {
        const { sendLoadingSlipEmail } = await import("@/app/actions/email");
        let targetEmail = data.email;
        if (!targetEmail) {
          targetEmail = prompt("Please enter recipient email address:");
        }
        if (targetEmail) {
          await sendLoadingSlipEmail(result, userProfile, targetEmail);
          showAlert("success", "Loading slip created and emailed successfully!");
        } else {
          showAlert("error", "Email was not sent because no address was provided.");
        }
      }
      
      router.push("/user/loading-slips");
    } catch (err: any) {
      showAlert("error", err.message || "Failed to create loading slip");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
<div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Create Loading Slip</h1>
        <button 
          type="button"
          onClick={() => router.push("/user/loading-slips")} 
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-100 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          Cancel
        </button>
      </div>

      <form className="space-y-2">

        <Accordion title="Goods Owner Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Goods Owner Name *</label>
              <input required {...register("ownerName")} placeholder="Full name" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone / WhatsApp *</label>
              <input required {...register("phone")} placeholder="+91 XXXXX XXXXX" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input {...register("email")} placeholder="optional@email.com" type="email" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">PAN No.</label>
              <input {...register("pan")} placeholder="ABCDE1234F" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Company Name</label>
              <input {...register("companyName")} placeholder="Optional" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date *</label>
              <input required {...register("date")} type="date" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Vehicle & Route">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vehicle No. *</label>
              <input required {...register("vehicleNo")} placeholder="e.g. MH12AB1234" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Size</label>
              <input {...register("vehicleSize")} placeholder="e.g. 20 ft, 32 ft" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">From City *</label>
              <input required {...register("fromCity")} placeholder="Loading point" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">To City *</label>
              <input required {...register("toCity")} placeholder="Delivery point" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Driver Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Driver Name</label>
              <input {...register("driverName")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Driver Mobile</label>
              <input {...register("driverMobile")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Driver Licence No.</label>
              <input {...register("driverLicence")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Freight & Charges">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Weight</label>
              <input {...register("weight")} placeholder="e.g. 500 kg" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Rate</label>
              <input {...register("rate")} placeholder="e.g. ₹5000 fixed" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Freight (₹)</label>
              <input {...register("freight")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Advance (₹)</label>
              <input {...register("advance")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Balance (₹)</label>
              <input {...register("balance")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Guarantee</label>
              <input {...register("guarantee")} placeholder="e.g. Owner's risk" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Goods / Items List">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#5b21b6] text-white">
                  <th className="px-4 py-3 font-medium text-xs w-10 text-center">#</th>
                  <th className="px-4 py-3 font-medium text-xs">Item / Particulars</th>
                  <th className="px-4 py-3 font-medium text-xs w-24 text-center">Qty</th>
                  <th className="px-4 py-3 font-medium text-xs w-32 text-center">Condition</th>
                  <th className="px-4 py-3 font-medium text-xs">Remarks</th>
                  <th className="px-4 py-3 font-medium text-xs w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2 text-center text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-2">
                      <input required {...register(`items.${index}.name`)} placeholder="e.g. Sofa, TV, Boxes" className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm focus:ring-1 focus:ring-primary outline-none" />
                    </td>
                    <td className="px-4 py-2">
                      <input required type="number" {...register(`items.${index}.quantity`)} className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-center focus:ring-1 focus:ring-primary outline-none" />
                    </td>
                    <td className="px-4 py-2">
                      <select {...register(`items.${index}.condition`)} className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm focus:ring-1 focus:ring-primary outline-none">
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                        <option value="Damaged">Damaged</option>
                        <option value="New">New</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input {...register(`items.${index}.remark`)} className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm focus:ring-1 focus:ring-primary outline-none" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button type="button" onClick={() => remove(index)} className="text-danger hover:text-danger/80 p-1 rounded-md hover:bg-danger/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pb-2">
            <button 
              type="button" 
              onClick={() => append({ name: "", quantity: 1, condition: "Good", remark: "" })}
              className="flex items-center gap-1 px-4 py-2 bg-[#5b21b6] text-white text-sm font-medium rounded hover:bg-[#5b21b6]/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </Accordion>

        <Accordion title="Detention Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Detention Charge (₹)</label>
              <input {...register("detentionCharge")} type="number" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Detention Type</label>
              <input {...register("detentionType")} placeholder="e.g. per day, hourly" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Remark</label>
            <input {...register("detentionRemark")} placeholder="Any remark about goods or loading" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea {...register("notes")} rows={4} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y" placeholder="Add any additional notes here..."></textarea>
          </div>
        </Accordion>

        {/* Action Buttons */}
        <div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-row justify-between items-center mt-6 overflow-x-auto gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap shrink-0">
            Items: <span className="text-foreground">{fields.length}</span>
          </div>
          <div className="flex flex-row gap-2 sm:gap-3 shrink-0">
            <button 
              type="button"
              onClick={handleSubmit((data) => onSave(data, 'submit'))}
              disabled={saving}
              className="px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-[#f3e8ff] text-[#5b21b6] font-semibold rounded-lg hover:bg-[#e9d5ff] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Submit"}
            </button>
            <button 
              type="button"
              onClick={handleSubmit((data) => onSave(data, 'send'))}
              disabled={saving}
              className="px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-[#5b21b6] text-white font-semibold rounded-lg hover:bg-[#5b21b6]/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {saving ? "Saving..." : "Submit & Send PDF"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}