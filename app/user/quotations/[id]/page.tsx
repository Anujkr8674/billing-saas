"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { getQuotationById, updateQuotation } from "@/app/actions/documents";
import { useStates, useCities } from "@/hooks/useLocations";
import { getUserProfile } from "@/app/actions/user";
import { sendQuotationEmail } from "@/app/actions/email";
import { useAlert } from "@/components/providers/AlertModalProvider";

function Accordion({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden mb-6">
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

export default function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const { register, control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      quotationNumber: "",
      movingType: "Local",
      companyName: "",
      companyGst: "",
      partyName: "",
      phone: "",
      email: "",
      quotationDate: new Date().toISOString().split('T')[0],
      packingDate: "",
      movingDate: "",
      
      moveFrom: { country: "India", state: "", city: "", pincode: "", address: "", floor: "Ground Floor", lift: "No" },
      moveTo: { country: "India", state: "", city: "", pincode: "", address: "", floor: "Ground Floor", lift: "No" },

      payment: {
        freightCharge: 0, advancePaid: 0,
        packingChargeType: "Included in Freight", packingChargeAmount: 0,
        unPackingChargeType: "Included in Freight", unPackingChargeAmount: 0,
        loadingChargeType: "Included in Freight", loadingChargeAmount: 0,
        unLoadingChargeType: "Included in Freight", unLoadingChargeAmount: 0,
        packingMaterialType: "Included in Freight", packingMaterialAmount: 0,
        transportChargeType: "Included in Freight", transportChargeAmount: 0,
        storageCharge: 0, carTransportCharge: 0,
        miscCharge: 0, otherCharge: 0,
        stCharge: 0, octroiCharge: 0,
        surchargeType: "Not Applicable", surchargePercent: "5",
        gstShowHide: "GST Charge Show In Quotation", gstPercent: "18", gstType: "CGST/SGST",
        totalAmountShowHide: "Show", remark: "", discount: 0,
        
        insuranceType: "Optional", insurancePercent: "1", insuranceGst: "18", declarationValue: 0,
        vInsuranceType: "Not Applicable", vInsurancePercent: "1", vInsuranceGst: "18", vDeclarationValue: 0
      },

      items: [{ name: "", quantity: 1, rate: 0, value: 0, remark: "" }],
      isVehicleShifting: false
    }
  });

  useEffect(() => {
    getUserProfile().then(data => {
      if (data) setUserProfile(data);
    });

    getQuotationById(id).then(data => {
      if (data && data.details) {
        reset({ ...(data.details as any), quotationNumber: data.docNumber });
      }
      setLoading(false);
    });
  }, [id, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const moveFromState = watch("moveFrom.state");
  const moveToState = watch("moveTo.state");

  const { states: fromStates, loading: statesLoading1 } = useStates();
  const { cities: fromCities, loading: citiesLoading1 } = useCities(moveFromState);
  
  const { states: toStates, loading: statesLoading2 } = useStates();
  const { cities: toCities, loading: citiesLoading2 } = useCities(moveToState);

  // Calculations
  const payment = watch("payment");
  const watchedItems = watch("items") || [];
  
  const pAmount = (val: any) => Number(val) || 0;
  
  const freightTotal = pAmount(payment?.freightCharge) 
    + pAmount(payment?.packingChargeAmount) + pAmount(payment?.unPackingChargeAmount)
    + pAmount(payment?.loadingChargeAmount) + pAmount(payment?.unLoadingChargeAmount)
    + pAmount(payment?.packingMaterialAmount) + pAmount(payment?.transportChargeAmount)
    + pAmount(payment?.storageCharge) + pAmount(payment?.carTransportCharge)
    + pAmount(payment?.miscCharge) + pAmount(payment?.otherCharge)
    + pAmount(payment?.stCharge) + pAmount(payment?.octroiCharge);

  const itemsTotal = watchedItems.reduce((acc, item) => acc + pAmount(item.value), 0);
  const baseTotal = freightTotal + itemsTotal;

  const surchargeAmount = payment?.surchargeType !== "Not Applicable" ? baseTotal * (pAmount(payment?.surchargePercent) / 100) : 0;
  
  const insuranceAmount = payment?.insuranceType !== "Not Applicable" ? pAmount(payment?.declarationValue) * (pAmount(payment?.insurancePercent) / 100) : 0;
  const vInsuranceAmount = payment?.vInsuranceType !== "Not Applicable" ? pAmount(payment?.vDeclarationValue) * (pAmount(payment?.vInsurancePercent) / 100) : 0;

  const subTotal = baseTotal + surchargeAmount + insuranceAmount + vInsuranceAmount;
  const afterDiscount = subTotal - pAmount(payment?.discount);

  const gstAmount = afterDiscount * (pAmount(payment?.gstPercent) / 100);
  const cgst = payment?.gstType === "CGST/SGST" ? gstAmount / 2 : 0;
  const sgst = payment?.gstType === "CGST/SGST" ? gstAmount / 2 : 0;
  const igst = payment?.gstType === "IGST" ? gstAmount : 0;

  const grandTotal = afterDiscount + gstAmount - pAmount(payment?.advancePaid);

  const onSave = async (data: any, actionType: 'submit' | 'send') => {
    setLoading(true);
    
    const finalData = {
      ...data,
      calculations: {
        freightTotal, subTotal, cgst, sgst, igst, grandTotal
      }
    };

    try {
      const updatedQuotation = await updateQuotation(id, {
        clientName: data.partyName || data.companyName,
        totalAmount: grandTotal,
        date: new Date(data.quotationDate),
        details: finalData
      });
      
      if (actionType === 'send') {
        await sendQuotationEmail(updatedQuotation, userProfile, data.email);
        showAlert("success", "Quotation Updated & Sent via Email!");
      } else {
        showAlert("success", "Quotation Updated successfully!");
      }
      
      router.push("/user/quotations");
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to update quotation");
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground font-medium">Loading Quotation Form...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
<div className="flex flex-row items-center justify-between gap-2 sm:gap-4 bg-card py-2 px-3 sm:px-4 rounded-lg shadow-sm border border-primary/20 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Edit Quotation</h1>
        <button 
          type="button"
          onClick={() => router.push("/user/quotations")} 
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-100 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          Cancel
        </button>
      </div>
      
      <form className="space-y-6">
        
        {/* QUOTATION DETAILS */}
        <Accordion title="QUOTATION DETAILS (कोटेशन का विवरण)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Quotation Number</label>
              <input readOnly disabled {...register("quotationNumber")} className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Moving Type</label>
              <select {...register("movingType")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option value="Local">Local</option>
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Company Name of Party</label>
              <input {...register("companyName")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Company GST No.</label>
              <input {...register("companyGst")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm uppercase" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Party Name <span className="text-danger">*</span></label>
              <input required {...register("partyName")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
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
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Quotation Date</label>
              <input type="date" {...register("quotationDate")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Packing Date</label>
              <input type="date" {...register("packingDate")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Moving Date</label>
              <input type="date" {...register("movingDate")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
          </div>
        </Accordion>

        {/* MOVE FROM */}
        <Accordion title="MOVE FROM (जहां से सामान जाएगा)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Country</label>
              <input {...register("moveFrom.country")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">State {statesLoading1 && "(Loading...)"}</label>
              <select {...register("moveFrom.state")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option value="">-- Select State --</option>
                {fromStates.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">City {citiesLoading1 && "(Loading...)"}</label>
              <select {...register("moveFrom.city")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option value="">-- Select City --</option>
                {fromCities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Pincode</label>
              <input {...register("moveFrom.pincode")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Address</label>
              <textarea {...register("moveFrom.address")} rows={2} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Floor</label>
              <select {...register("moveFrom.floor")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option>Ground Floor</option>
                <option>1st Floor</option>
                <option>2nd Floor</option>
                <option>3rd Floor</option>
                <option>4th Floor</option>
                <option>5th+ Floor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Is Lift Available</label>
              <select {...register("moveFrom.lift")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>
        </Accordion>

        {/* MOVE TO */}
        <Accordion title="MOVE TO (जहां सामान जाना है)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Country</label>
              <input {...register("moveTo.country")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">State {statesLoading2 && "(Loading...)"}</label>
              <select {...register("moveTo.state")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option value="">-- Select State --</option>
                {toStates.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">City {citiesLoading2 && "(Loading...)"}</label>
              <select {...register("moveTo.city")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option value="">-- Select City --</option>
                {toCities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Pincode</label>
              <input {...register("moveTo.pincode")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Address</label>
              <textarea {...register("moveTo.address")} rows={2} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Floor</label>
              <select {...register("moveTo.floor")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option>Ground Floor</option>
                <option>1st Floor</option>
                <option>2nd Floor</option>
                <option>3rd Floor</option>
                <option>4th Floor</option>
                <option>5th+ Floor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Is Lift Available</label>
              <select {...register("moveTo.lift")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          </div>
        </Accordion>

        {/* PAYMENT DETAILS */}
        <Accordion title="PAYMENT DETAILS (पेमेंट का विवरण)">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1 text-primary">Freight Charge</label>
                  <input type="number" {...register("payment.freightCharge")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1 text-primary">Advance Paid</label>
                  <input type="number" {...register("payment.advancePaid")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                </div>
              </div>

              {[
                { label: "Packing Charge", id: "packingCharge" },
                { label: "Un Packing Charge", id: "unPackingCharge" },
                { label: "Loading Charge", id: "loadingCharge" },
                { label: "Un Loading Charge", id: "unLoadingCharge" },
                { label: "Packing Material Charge", id: "packingMaterial" },
                { label: "Transport Charge", id: "transportCharge" }
              ].map((c) => (
                <div key={c.id} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{c.label}</label>
                    <select {...register(`payment.${c.id}Type` as any)} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option>Included in Freight</option>
                      <option>Extra</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <input type="number" {...register(`payment.${c.id}Amount` as any)} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Storage Charge</label>
                  <input type="number" {...register("payment.storageCharge")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Car Transport Charge</label>
                  <input type="number" {...register("payment.carTransportCharge")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Miscellaneous Charges</label>
                  <input type="number" {...register("payment.miscCharge")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Other Charges</label>
                  <input type="number" {...register("payment.otherCharge")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">S.T. Charge</label>
                  <input type="number" {...register("payment.stCharge")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Octroi Green Tax</label>
                  <input type="number" {...register("payment.octroiCharge")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Surcharge</label>
                  <select {...register("payment.surchargeType")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                    <option>Not Applicable</option>
                    <option>Applicable</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <select {...register("payment.surchargePercent")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">GST Show/Hide</label>
                  <select {...register("payment.gstShowHide")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                    <option>GST Charge Show In Quotation</option>
                    <option>Hide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">GST %</label>
                  <select {...register("payment.gstPercent")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                    <option value="5">5</option>
                    <option value="12">12</option>
                    <option value="18">18</option>
                    <option value="28">28</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">GST Type</label>
                  <select {...register("payment.gstType")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                    <option>CGST/SGST</option>
                    <option>IGST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Total Amount Show/Hide In PDF</label>
                <select {...register("payment.totalAmountShowHide")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                  <option>Show</option>
                  <option>Hide</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Remark</label>
                <textarea {...register("payment.remark")} rows={3} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Discount (Applicable on Sub-Total)</label>
                <input type="number" {...register("payment.discount")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm mt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Freight + Charges:</span> <span className="font-medium">₹{freightTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sub-Total:</span> <span className="font-medium">₹{subTotal.toFixed(2)}</span></div>
                {payment?.gstType === "CGST/SGST" ? (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">CGST ({(pAmount(payment?.gstPercent)/2).toFixed(1)}%):</span> <span className="font-medium">₹{cgst.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">SGST ({(pAmount(payment?.gstPercent)/2).toFixed(1)}%):</span> <span className="font-medium">₹{sgst.toFixed(2)}</span></div>
                  </>
                ) : (
                  <div className="flex justify-between"><span className="text-muted-foreground">IGST ({payment?.gstPercent}%):</span> <span className="font-medium">₹{igst.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-bold text-foreground">Grand Total:</span> <span className="font-bold text-primary text-base">₹{grandTotal.toFixed(2)}</span></div>
              </div>

            </div>
            
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-4 bg-muted/20">
                <h3 className="text-sm font-bold text-foreground uppercase mb-4">Insurance Details (इन्श्योरेंस जानकारी)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Insurance Type</label>
                    <select {...register("payment.insuranceType")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option>Optional</option>
                      <option>Not Applicable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Insurance Charge @Percent (%)</label>
                    <select {...register("payment.insurancePercent")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option value="1">1%</option>
                      <option value="3">3%</option>
                      <option value="5">5%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">GST %</label>
                    <select {...register("payment.insuranceGst")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option value="18">18</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Declaration Value of Goods</label>
                    <input type="number" {...register("payment.declarationValue")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 bg-muted/20">
                <h3 className="text-sm font-bold text-foreground uppercase mb-4">Vehicle Insurance Details (गाड़ी इन्श्योरेंस)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Insurance Type</label>
                    <select {...register("payment.vInsuranceType")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option>Not Applicable</option>
                      <option>Optional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Insurance Charge @Percent (%)</label>
                    <select {...register("payment.vInsurancePercent")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option value="1">1%</option>
                      <option value="3">3%</option>
                      <option value="5">5%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">GST %</label>
                    <select {...register("payment.vInsuranceGst")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
                      <option value="18">18</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Declaration Value of Vehicle</label>
                    <input type="number" {...register("payment.vDeclarationValue")} className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Accordion>

        {/* ITEMS */}
        <Accordion title="ITEM / PARTICULARS DETAILS (सामान का विवरण)">
          <div className="overflow-x-auto border border-border rounded-lg mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1e40af] text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Item / Particulars Name</th>
                  <th className="px-4 py-3 font-medium">Rate / Item</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Value (कीमत) (In Rupees)</th>
                  <th className="px-4 py-3 font-medium">Remark</th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fields.map((field, index) => (
                  <tr key={field.id} className="bg-card">
                    <td className="px-4 py-2 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-2">
                      <input {...register(`items.${index}.name`)} placeholder="- Select Item -" className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm" />
                    </td>
                    <td className="px-4 py-2 w-32">
                      <input 
                        type="number" 
                        {...register(`items.${index}.rate`, {
                          onChange: (e) => {
                            const r = pAmount(e.target.value);
                            const q = pAmount(watchedItems[index]?.quantity);
                            setValue(`items.${index}.value`, q * r);
                          }
                        })} 
                        placeholder="Rate"
                        className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm" 
                      />
                    </td>
                    <td className="px-4 py-2 w-24">
                      <input 
                        type="number" 
                        {...register(`items.${index}.quantity`, {
                          onChange: (e) => {
                            const q = pAmount(e.target.value);
                            const r = pAmount(watchedItems[index]?.rate);
                            setValue(`items.${index}.value`, q * r);
                          }
                        })} 
                        className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm" 
                      />
                    </td>
                    <td className="px-4 py-2 w-32">
                      <input type="number" {...register(`items.${index}.value`)} readOnly className="w-full px-2 py-1.5 bg-muted text-muted-foreground border border-border rounded text-sm cursor-not-allowed" />
                    </td>
                    <td className="px-4 py-2">
                      <input {...register(`items.${index}.remark`)} className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm" />
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
            onClick={() => append({ name: "", quantity: 1, rate: 0, value: 0, remark: "" })}
            className="flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white text-sm font-bold rounded-md hover:bg-[#ea580c] transition-colors uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add Item / Particular (सामान जोड़ें)
          </button>
        </Accordion>

        {/* VEHICLE SHIFTING */}
        <Accordion title="VEHICLE SHIFTING (गाड़ी शिफ्टिंग)">
          <div className="flex items-center gap-3 py-2">
            <input type="checkbox" id="vShifting" {...register("isVehicleShifting")} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="vShifting" className="text-sm font-medium text-foreground">Is Vehicle Shifting? (क्या गाड़ी भी शिफ्ट होगी?)</label>
          </div>
        </Accordion>

      </form>

      <div className="bg-card p-4 border border-border rounded-xl shadow-sm flex flex-row overflow-x-auto justify-between items-center mt-6 gap-4">
        <div className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap shrink-0">
          Items: <span className="text-foreground">{fields?.length || 0}</span>
        </div>
        <div className="flex flex-row justify-end gap-2 sm:gap-3 shrink-0">
          <button 
          onClick={handleSubmit((d) => onSave(d, 'submit'))} 
          disabled={loading} 
          className="px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          Update Quotation
        </button>
        <button 
          onClick={handleSubmit((d) => onSave(d, 'send'))} 
          disabled={loading} 
          className="px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm whitespace-nowrap.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Update & Send PDF
        </button>
        </div>
      </div>

    </div>
  );
}