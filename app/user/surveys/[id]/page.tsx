"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { getSurveyById, updateSurvey } from "@/app/actions/documents";
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

export default function EditSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      address: "",
      surveyDate: new Date().toISOString().split('T')[0],
      shiftingDate: "",
      surveyorName: "",
      vehicleNo: "",
      fromAddress: "",
      toAddress: "",
      items: [
        { name: "", rate: 0, quantity: 1, value: 0, cft: 0, condition: "Good", remark: "" }
      ],
      notes: ""
    }
  });

  const watchedItems = watch("items") || [];
  const pAmount = (val: any) => parseFloat(val) || 0;

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    getUserProfile().then(data => {
      if (data) setUserProfile(data);
    });
    
    getSurveyById(id).then(data => {
      if (data) {
        const details: any = data.details || {};
        reset({
          ...details,
          customerName: data.clientName || details.customerName || "",
          surveyDate: data.date ? new Date(data.date).toISOString().split('T')[0] : details.surveyDate
        });
      }
      setLoading(false);
    });
  }, [id, reset]);

  const onSave = async (data: any, actionType: 'submit' | 'send' = 'submit') => {
    setSaving(true);
    try {
      const updatedSurvey = await updateSurvey(id, {
        clientName: data.customerName,
        date: new Date(data.surveyDate),
        details: data
      });
      
      if (actionType === 'send') {
        const { sendSurveyEmail } = await import("@/app/actions/email");
        await sendSurveyEmail(updatedSurvey, userProfile, data.email);
        showAlert("success", "Survey saved and email sent!");
        router.push("/user/surveys");
      } else {
        router.push("/user/surveys");
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to update survey");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Survey...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Survey</h1>
        </div>
        <button 
          onClick={() => router.push("/user/surveys")} 
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-200 focus:outline-none"
        >
          Cancel
        </button>
      </div>

      <form className="space-y-2">

        <Accordion title="Customer Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Customer Name *</label>
              <input required {...register("customerName")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone *</label>
              <input required {...register("phone")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input {...register("email")} type="email" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
              <input {...register("address")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Survey Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Survey Date *</label>
              <input required {...register("surveyDate")} type="date" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Shifting Date</label>
              <input {...register("shiftingDate")} type="date" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Surveyor Name</label>
              <input {...register("surveyorName")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vehicle No.</label>
              <input {...register("vehicleNo")} placeholder="e.g. JH01AB1234" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">From Address *</label>
              <textarea required {...register("fromAddress")} rows={2} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">To Address *</label>
              <textarea required {...register("toAddress")} rows={2} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"></textarea>
            </div>
          </div>
        </Accordion>

        <Accordion title="Goods Survey Items">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#5b21b6] text-white">
                  <th className="px-4 py-3 font-medium text-xs w-10 text-center">#</th>
                  <th className="px-4 py-3 font-medium text-xs">Item / Particulars Name</th>
                  <th className="px-4 py-3 font-medium text-xs w-28 text-center">Rate / Item</th>
                  <th className="px-4 py-3 font-medium text-xs w-24 text-center">Quantity</th>
                  <th className="px-4 py-3 font-medium text-xs w-32 text-center">Value (कीमत)<br/>(In Rupees)</th>
                  <th className="px-4 py-3 font-medium text-xs w-24 text-center">CFT</th>
                  <th className="px-4 py-3 font-medium text-xs w-32 text-center">Condition</th>
                  <th className="px-4 py-3 font-medium text-xs">Remark</th>
                  <th className="px-4 py-3 font-medium text-xs w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2 text-center text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-2">
                      <input required {...register(`items.${index}.name`)} placeholder="- Select Item -" className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm focus:ring-1 focus:ring-primary outline-none" />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        {...register(`items.${index}.rate`, {
                          onChange: (e) => {
                            const r = pAmount(e.target.value);
                            const q = pAmount(watchedItems[index]?.quantity);
                            setValue(`items.${index}.value`, q * r);
                          }
                        })} 
                        className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-center focus:ring-1 focus:ring-primary outline-none" 
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        required 
                        type="number" 
                        {...register(`items.${index}.quantity`, {
                          onChange: (e) => {
                            const q = pAmount(e.target.value);
                            const r = pAmount(watchedItems[index]?.rate);
                            setValue(`items.${index}.value`, q * r);
                          }
                        })} 
                        className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-center focus:ring-1 focus:ring-primary outline-none" 
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" {...register(`items.${index}.value`)} readOnly className="w-full px-2 py-1.5 bg-muted text-muted-foreground border border-border rounded text-sm text-center cursor-not-allowed outline-none" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" {...register(`items.${index}.cft`)} className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-center focus:ring-1 focus:ring-primary outline-none" />
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
              onClick={() => append({ name: "", rate: 0, quantity: 1, value: 0, cft: 0, condition: "Good", remark: "" })}
              className="flex items-center gap-1 px-4 py-2 bg-[#5b21b6] text-white text-sm font-medium rounded hover:bg-[#5b21b6]/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </Accordion>

        <Accordion title="Notes">
          <div className="p-2">
            <textarea {...register("notes")} rows={4} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y" placeholder="Add any additional notes here..."></textarea>
          </div>
        </Accordion>

        {/* Action Buttons */}
        <div className="bg-card p-4 border border-border rounded-xl shadow-sm flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground font-medium">
            Items: <span className="text-foreground">{fields.length}</span>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={handleSubmit((data) => onSave(data, 'submit'))}
              disabled={saving}
              className="px-6 py-2 bg-white border border-[#1e40af] text-[#1e40af] font-medium rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              Update Document
            </button>
            <button 
              type="button"
              onClick={handleSubmit((data) => onSave(data, 'send'))}
              disabled={saving}
              className="px-6 py-2 bg-[#1e40af] text-white font-medium rounded-lg hover:bg-[#1e40af]/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {saving ? "Saving..." : "Submit & Send PDF"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}