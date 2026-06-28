"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { createPackingList } from "@/app/actions/documents";
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

const COMMON_ITEMS = [
  "Double Bed", "Single Bed", "Sofa Set", "Dining Table", "Dining Chair",
  "Almirah", "Wardrobe", "Fridge", "Washing Machine", "Air Conditioner",
  "Television", "TV Stand", "Center Table", "Computer/Laptop", "Microwave",
  "Gas Stove", "Cylinder", "Kitchen Utensils Box", "Clothes Box", "Books Box",
  "Shoes Box", "Miscellaneous Box", "Bike/Scooty", "Car"
];

export default function NewPackingListPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      address: "",

      packingDate: new Date().toISOString().split('T')[0],
      shiftingDate: "",
      fromCity: "",
      toCity: "",
      vehicleNo: "",
      packedBy: "",

      items: [
        { name: "", boxNumber: "", quantity: 1, value: 0, cft: 0, remark: "" }
      ],

      notes: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch("items");
  const totalQuantity = watchItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  useEffect(() => {
    getUserProfile().then(data => {
      if (data) setUserProfile(data);
    });
  }, []);

  const onSave = async (data: any, actionType: 'submit' | 'send' = 'submit') => {
    setSaving(true);
    try {
      const result = await createPackingList({
        date: new Date(data.packingDate),
        details: data
      });
      
      if (actionType === 'send') {
        const { sendPackingListEmail } = await import("@/app/actions/email");
        let targetEmail = data.email;
        if (!targetEmail) {
          targetEmail = prompt("Please enter recipient email address:");
        }
        if (targetEmail) {
          await sendPackingListEmail(result, userProfile, targetEmail);
          showAlert("success", "Packing List created and emailed successfully!");
        } else {
          showAlert("error", "Email was not sent because no address was provided.");
        }
      }
      
      router.push("/user/packing-lists");
    } catch (err: any) {
      showAlert("error", err.message || "Failed to create packing list");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Packing List</h1>
        </div>
        <button 
          onClick={() => router.push("/user/packing-lists")} 
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
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone / WhatsApp *</label>
              <input required {...register("phone")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input {...register("email")} placeholder="optional@email.com" type="email" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
              <input {...register("address")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Shifting Details">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Packing Date *</label>
              <input required {...register("packingDate")} type="date" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Shifting Date</label>
              <input {...register("shiftingDate")} type="date" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">From City *</label>
              <input required {...register("fromCity")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">To City *</label>
              <input required {...register("toCity")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Vehicle No.</label>
              <input {...register("vehicleNo")} placeholder="e.g. JH01AB1234" type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Packed By</label>
              <input {...register("packedBy")} type="text" className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Packing Items">
          <datalist id="common-items">
            {COMMON_ITEMS.map(item => <option key={item} value={item} />)}
          </datalist>
          
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => append({ name: "", boxNumber: "", quantity: 1, value: 0, cft: 0, remark: "" })}
              className="flex items-center gap-2 bg-[#2563eb] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#2563eb] text-white">
                  <th className="py-3 px-4 font-semibold text-xs uppercase w-12 text-center">#</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase min-w-[200px]">Item / Particulars Name</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase w-28 text-center">Box Number</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase w-24 text-center">Quantity</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase w-32 text-center">Value (कीमत)<br/><span className="text-[10px] opacity-80">(In Rupees)</span></th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase w-24 text-center">CFT</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase min-w-[150px]">Remark</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-muted/10">
                    <td className="py-2 px-4 text-center text-sm font-medium text-muted-foreground">{index + 1}</td>
                    <td className="py-2 px-4">
                      <input 
                        list="common-items"
                        {...register(`items.${index}.name`)} 
                        placeholder="Select or type item..."
                        className="w-full px-3 py-1.5 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input 
                        {...register(`items.${index}.boxNumber`)} 
                        type="text"
                        className="w-full px-3 py-1.5 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center" 
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input 
                        {...register(`items.${index}.quantity`)} 
                        type="number" min="1"
                        className="w-full px-3 py-1.5 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center" 
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input 
                        {...register(`items.${index}.value`)} 
                        type="number" min="0"
                        className="w-full px-3 py-1.5 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-right" 
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input 
                        {...register(`items.${index}.cft`)} 
                        type="number" min="0" step="0.01"
                        className="w-full px-3 py-1.5 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center" 
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input 
                        {...register(`items.${index}.remark`)} 
                        type="text"
                        className="w-full px-3 py-1.5 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button 
                        type="button" 
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {fields.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground text-sm">
                      No items added yet. Click "Add Item" to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 px-2 text-sm text-muted-foreground font-medium">
            <div>Total Items: <span className="text-foreground">{fields.length}</span></div>
            <div>Total Qty: <span className="text-foreground">{totalQuantity}</span></div>
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