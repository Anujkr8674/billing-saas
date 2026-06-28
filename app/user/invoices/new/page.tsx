"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { createInvoice } from "@/app/actions/invoices";
import { getUserProfile } from "@/app/actions/user";
import { sendInvoiceEmail } from "@/app/actions/email";
import { useAlert } from "@/components/providers/AlertModalProvider";

function Accordion({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden mb-6 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <span className="font-bold text-sm text-foreground uppercase tracking-wider">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {isOpen && <div className="p-4 border-t border-border">{children}</div>}
    </div>
  );
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    getUserProfile().then(data => {
      if (data) setUserProfile(data);
    });
  }, []);

  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      gstin: "",
      address: "",
      
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      fromCity: "",
      toCity: "",

      items: [
        { description: "", hsn: "", quantity: 1, rate: 0, amount: 0 }
      ],

      gstRate: "18", // 0, 5, 12, 18, 28, or IGST string maybe? Let's use 18 by default.
      gstType: "CGST/SGST", // CGST/SGST or IGST
      amountPaid: 0,
      paymentMode: "Cash",

      terms: "1. Payment is due within 15 days.\n2. Late payments attract 2% monthly interest.\n3. Subject to local jurisdiction.",
      internalNotes: ""
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const gstRate = watch("gstRate");
  const gstType = watch("gstType");
  const amountPaid = watch("amountPaid");

  const pAmount = (val: any) => Number(val) || 0;

  const subtotal = watchedItems.reduce((acc, item) => acc + pAmount(item.amount), 0);
  
  const gstPercent = pAmount(gstRate);
  const gstAmount = subtotal * (gstPercent / 100);
  
  const cgst = gstType === "CGST/SGST" ? gstAmount / 2 : 0;
  const sgst = gstType === "CGST/SGST" ? gstAmount / 2 : 0;
  const igst = gstType === "IGST" ? gstAmount : 0;

  const grandTotal = subtotal + gstAmount;
  const balanceDue = grandTotal - pAmount(amountPaid);

  const onSave = async (data: any, actionType: 'submit' | 'send') => {
    setLoading(true);

    const finalData = {
      ...data,
      calculations: {
        subtotal,
        cgst,
        sgst,
        igst,
        grandTotal,
        amountPaid: pAmount(data.amountPaid),
        balanceDue
      }
    };

    try {
      const createdInvoice = await createInvoice({
        clientName: data.customerName,
        totalAmount: grandTotal,
        date: new Date(data.invoiceDate),
        details: finalData
      });

      if (actionType === 'send') {
        let targetEmail = data.email;
        if (!targetEmail) {
          showAlert("error", "Please provide an email address for the customer to send the invoice.");
          setLoading(false);
          return;
        }
        await sendInvoiceEmail(createdInvoice, userProfile, targetEmail);
        showAlert("success", "Invoice Saved & Sent via Email!");
      } else {
        showAlert("success", "Invoice Saved successfully!");
      }

      router.push("/user/invoices");
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to save invoice");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Create GST Invoice</h1>
        <button 
          onClick={() => router.push("/user/invoices")} 
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-200 focus:outline-none"
        >
          Cancel
        </button>
      </div>

      <form className="space-y-6">

        {/* BILLED TO */}
        <Accordion title="BILLED TO (ग्राहक का विवरण)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Customer Name <span className="text-danger">*</span></label>
              <input required {...register("customerName")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Phone <span className="text-danger">*</span></label>
              <input required {...register("phone")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Email</label>
              <input type="email" {...register("email")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">GSTIN</label>
              <input {...register("gstin")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm uppercase" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Address</label>
              <textarea {...register("address")} rows={2} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm resize-none"></textarea>
            </div>
          </div>
        </Accordion>

        {/* INVOICE DETAILS */}
        <Accordion title="INVOICE DETAILS (इन्वॉयस का विवरण)">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Invoice Date <span className="text-danger">*</span></label>
              <input type="date" required {...register("invoiceDate")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Due Date</label>
              <input type="date" {...register("dueDate")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">From City <span className="text-danger">*</span></label>
              <input required {...register("fromCity")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">To City <span className="text-danger">*</span></label>
              <input required {...register("toCity")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
          </div>
        </Accordion>

        {/* ITEMS */}
        <Accordion title="LINE ITEMS (सामान का विवरण)">
          <div className="overflow-x-auto border border-border rounded-lg mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#5b21b6] text-white">
                <tr>
                  <th className="px-4 py-3 font-medium w-12">#</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium w-32">HSN/SAC</th>
                  <th className="px-4 py-3 font-medium w-24">Qty</th>
                  <th className="px-4 py-3 font-medium w-32">Rate</th>
                  <th className="px-4 py-3 font-medium w-32">Amount</th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fields.map((field, index) => (
                  <tr key={field.id} className="bg-card">
                    <td className="px-4 py-2 text-muted-foreground text-center">{index + 1}</td>
                    <td className="px-4 py-2">
                      <input {...register(`items.${index}.description`)} placeholder="Item Description" className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm" />
                    </td>
                    <td className="px-4 py-2">
                      <input {...register(`items.${index}.hsn`)} placeholder="HSN/SAC" className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm" />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        {...register(`items.${index}.quantity`, {
                          onChange: (e) => {
                            const q = pAmount(e.target.value);
                            const r = pAmount(watchedItems[index]?.rate);
                            setValue(`items.${index}.amount`, q * r);
                          }
                        })} 
                        className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm" 
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        {...register(`items.${index}.rate`, {
                          onChange: (e) => {
                            const r = pAmount(e.target.value);
                            const q = pAmount(watchedItems[index]?.quantity);
                            setValue(`items.${index}.amount`, q * r);
                          }
                        })} 
                        placeholder="Rate"
                        className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm" 
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" {...register(`items.${index}.amount`)} readOnly className="w-full px-2 py-1.5 bg-muted text-muted-foreground border border-border rounded text-sm cursor-not-allowed font-medium" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button type="button" onClick={() => remove(index)} className="text-danger hover:text-danger/80 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => append({ description: "", hsn: "", quantity: 1, rate: 0, amount: 0 })}
            className="flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white text-sm font-bold rounded-md hover:bg-[#ea580c] transition-colors uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </Accordion>

        {/* CALCULATIONS & TERMS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Accordion title="TERMS & NOTES (शर्तें और नोट्स)">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Terms & Conditions</label>
                  <textarea {...register("terms")} rows={4} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Internal Notes</label>
                  <textarea {...register("internalNotes")} rows={3} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm resize-none"></textarea>
                </div>
              </div>
            </Accordion>
          </div>

          <div>
            <Accordion title="CALCULATIONS (कैलकुलेशन)">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">GST Rate %</label>
                    <select {...register("gstRate")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">GST Type</label>
                    <select {...register("gstType")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option>CGST/SGST</option>
                      <option>IGST</option>
                    </select>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-3 text-sm mt-4 border border-border">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span> <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span></div>
                  {gstType === "CGST/SGST" ? (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">CGST ({(gstPercent / 2).toFixed(1)}%):</span> <span className="font-medium text-foreground">₹{cgst.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">SGST ({(gstPercent / 2).toFixed(1)}%):</span> <span className="font-medium text-foreground">₹{sgst.toFixed(2)}</span></div>
                    </>
                  ) : (
                    <div className="flex justify-between"><span className="text-muted-foreground">IGST ({gstPercent}%):</span> <span className="font-medium text-foreground">₹{igst.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between border-t border-border pt-3 mt-3"><span className="font-bold text-foreground text-base">Grand Total:</span> <span className="font-bold text-primary text-lg">₹{grandTotal.toFixed(2)}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Amount Paid (₹)</label>
                    <input type="number" {...register("amountPaid")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Payment Mode</label>
                    <select {...register("paymentMode")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option>Cash</option>
                      <option>Bank Transfer / NEFT</option>
                      <option>UPI / Google Pay</option>
                      <option>Cheque</option>
                      <option>Credit Card</option>
                    </select>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex justify-between items-center border border-red-100 dark:border-red-900/30">
                  <span className="font-bold text-red-600 dark:text-red-400">Balance Due:</span> 
                  <span className="font-bold text-red-600 dark:text-red-400 text-lg">₹{balanceDue.toFixed(2)}</span>
                </div>
              </div>
            </Accordion>
          </div>
        </div>

      </form>

      {/* FIXED BOTTOM ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card border-t border-border p-4 shadow-lg z-40 flex items-center justify-end gap-4">
        <button
          onClick={handleSubmit((d) => onSave(d, 'submit'))}
          disabled={loading}
          className="px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Submit"}
        </button>
        <button
          onClick={handleSubmit((d) => onSave(d, 'send'))}
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Sending..." : "Submit & Send PDF"}
        </button>
      </div>

    </div>
  );
}
