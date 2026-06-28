"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { ChevronDown, Send, FileText } from "lucide-react";
import { getVehicleConditionById, updateVehicleCondition } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import { toast } from "sonner";
import { sendVehicleConditionEmail } from "@/app/actions/email"; 

export default function EditVehicleConditionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionType, setActionType] = useState<"save" | "send">("save");
  const actionTypeRef = useRef<"save" | "send">("save");
  const [userProfile, setUserProfile] = useState<any>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    conditionDetails: true,
    vehicleDetails: true,
    accessoriesDetails: true,
    dentScratches: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      docNumber: "",
      lrNumber: "",
      partyName: "",
      phone: "",
      email: "",
      date: new Date().toISOString().split("T")[0],
      moveFromAddress: "",
      moveToAddress: "",

      vehicleType: "",
      vehicleBrandName: "",
      vehicleValue: "0",
      insurancePolicyNo: "",
      insuranceCompanyName: "",
      vehicleRegNo: "",
      manufacturingYear: "",
      colour: "",
      vehicleKilometer: "",
      chassisNo: "",
      engineNo: "",

      accessories: {
        stepney: "no",
        wheelCaps: "no",
        sideRearViewMirror: "no",
        carRadioPlayer: "no",
        airCondition: "no",
        lighter: "no",
        digitalWatch: "no",
        speaker: "no",
        toolKit: "no",
        jack: "no",
        wiperArmsBlades: "no",
        mudFlap: "no",
        floorRubberCarpet: "no",
        fuel: "no",
        carCover: "no",
      },
      batteryNo: "",
      tyreNo: "",
      otherAccessories: "",
      anyRemark: "",

      scratches: "",
      dent: "",
      anyOtherVisibleObservation: ""
    }
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const [profile, doc] = await Promise.all([
          getUserProfile(),
          getVehicleConditionById(id)
        ]);
        setUserProfile(profile);

        if (doc && doc.details) {
          reset({
            ...doc.details,
            docNumber: doc.docNumber,
            date: new Date(doc.date).toISOString().split("T")[0]
          });
        }
      } catch (err) {
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        vehicleNo: data.vehicleRegNo,
        date: new Date(data.date),
        details: {
          ...data
        }
      };

      const result = await updateVehicleCondition(id, payload);
      toast.success("Vehicle Condition Report updated successfully!");
      
      if (actionTypeRef.current === "send") {
        let targetEmail = data.email;
        if (!targetEmail) {
          targetEmail = prompt("Please enter recipient email address:");
        }
        if (targetEmail) {
          toast.loading("Sending email...", { id: "email-toast" });
          try {
            const safeResult = JSON.parse(JSON.stringify(await getVehicleConditionById(id)));
            const safeProfile = JSON.parse(JSON.stringify(userProfile));
            await sendVehicleConditionEmail(safeResult, safeProfile, targetEmail);
            toast.success("Email sent successfully!", { id: "email-toast" });
          } catch (e: any) {
            toast.error(e.message || "Failed to send email", { id: "email-toast" });
          }
        } else {
          toast.error("Email was not sent because no address was provided.");
        }
      }

      router.push("/user/vehicle-conditions");
    } catch (error: any) {
      toast.error(error.message || "Failed to update Vehicle Condition Report");
    } finally {
      setSaving(false);
    }
  };

  const renderRadioGroup = (name: string, label: string) => (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground uppercase">{label}</span>
      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" value="yes" {...register(`accessories.${name}` as any)} className="w-4 h-4 text-[#5b21b6] focus:ring-[#5b21b6]" />
          <span className="text-sm font-medium">YES</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" value="no" {...register(`accessories.${name}` as any)} className="w-4 h-4 text-[#5b21b6] focus:ring-[#5b21b6]" />
          <span className="text-sm font-medium">NO</span>
        </label>
      </div>
    </div>
  );

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading form...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Vehicle Condition Report</h1>
          <p className="text-muted-foreground text-sm mt-1">Update the details below</p>
        </div>
        <button 
          onClick={() => router.push("/user/vehicle-conditions")} 
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm focus:ring-2 focus:ring-red-200 focus:outline-none"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* VEHICLE CONDITION DETAILS */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <button 
            type="button" 
            onClick={() => toggleSection("conditionDetails")}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">VEHICLE CONDITION DETAILS (वाहन की स्थिति का विवरण)</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.conditionDetails ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.conditionDetails && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">VEHICLE CONDITION NUMBER</label>
                <input type="text" {...register("docNumber")} disabled className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">LR NUMBER</label>
                <input type="text" {...register("lrNumber")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">PARTY NAME *</label>
                <input type="text" required {...register("partyName")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">PHONE / WHATSAPP</label>
                <input type="text" {...register("phone")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">EMAIL</label>
                <input type="email" {...register("email")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">DATE</label>
                <input type="date" required {...register("date")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">MOVE FROM ADDRESS</label>
                <input type="text" {...register("moveFromAddress")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">MOVE TO ADDRESS</label>
                <input type="text" {...register("moveToAddress")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
              </div>
            </div>
          )}
        </div>

        {/* VEHICLE DETAILS & ACCESSORIES */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <button 
            type="button" 
            onClick={() => toggleSection("vehicleDetails")}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">VEHICLE DETAILS (वाहन का विवरण)</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.vehicleDetails ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.vehicleDetails && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">VEHICLE TYPE EG. CAR/BIKE/OTHER</label>
                    <input type="text" placeholder="e.g. Car" {...register("vehicleType")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">VEHICLE BRAND NAME EG. TATA/TIAGO</label>
                    <input type="text" placeholder="e.g. Tata" {...register("vehicleBrandName")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">VEHICLE'S VALUE (INR)</label>
                    <input type="number" {...register("vehicleValue")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">INSURANCE POLICY NO.</label>
                    <input type="text" {...register("insurancePolicyNo")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">INSURANCE COMPANY NAME</label>
                    <input type="text" {...register("insuranceCompanyName")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">VEHICLE REG. NO.</label>
                    <input type="text" placeholder="JH01AB1234" {...register("vehicleRegNo")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">MANUFACTURING YEAR EG. 2020</label>
                    <input type="text" placeholder="2020" {...register("manufacturingYear")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">COLOUR EG. WHITE</label>
                    <input type="text" placeholder="White" {...register("colour")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">VEHICLE KILOMETER (KM)</label>
                    <input type="text" placeholder="Check Vehicle's Meter" {...register("vehicleKilometer")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">CHASSIS NO.</label>
                    <input type="text" {...register("chassisNo")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">ENGINE NO.</label>
                    <input type="text" {...register("engineNo")} className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 bg-muted/10 p-5 rounded-xl border border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4 pb-2 border-b border-border">ACCESSORIES DETAILS (वाहन के सामान का विवरण)</h3>
                <div className="space-y-1 mb-6">
                  {renderRadioGroup("stepney", "STEPNEY")}
                  {renderRadioGroup("wheelCaps", "WHEEL CAPS")}
                  {renderRadioGroup("sideRearViewMirror", "SIDE REAR VIEW MIRROR")}
                  {renderRadioGroup("carRadioPlayer", "CAR RADIO/PLAYER")}
                  {renderRadioGroup("airCondition", "AIR CONDITION")}
                  {renderRadioGroup("lighter", "LIGHTER")}
                  {renderRadioGroup("digitalWatch", "DIGITAL WATCH")}
                  {renderRadioGroup("speaker", "SPEAKER")}
                  {renderRadioGroup("toolKit", "TOOL KIT")}
                  {renderRadioGroup("jack", "JACK")}
                  {renderRadioGroup("wiperArmsBlades", "WIPER ARMS & BLADES")}
                  {renderRadioGroup("mudFlap", "MUD FLAP")}
                  {renderRadioGroup("floorRubberCarpet", "FLOOR RUBBER CARPET")}
                  {renderRadioGroup("fuel", "FUEL (PETROL/LTR.)")}
                  {renderRadioGroup("carCover", "CAR COVER")}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">BATTERY NO.</label>
                    <input type="text" {...register("batteryNo")} className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">TYRE NO.</label>
                    <input type="text" {...register("tyreNo")} className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">ANY OTHER ACCESSORIES</label>
                    <textarea {...register("otherAccessories")} rows={3} className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50 resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">ANY REMARK</label>
                    <textarea {...register("anyRemark")} rows={3} className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50 resize-none"></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DENT / SCRATCHES DETAILS */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <button 
            type="button" 
            onClick={() => toggleSection("dentScratches")}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">DENT / SCRATCHES DETAILS (डेंट/खरोंच का विवरण)</h2>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openSections.dentScratches ? "rotate-180" : ""}`} />
          </button>
          
          {openSections.dentScratches && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">SCRATCHES</label>
                <textarea {...register("scratches")} rows={4} className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50 resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">DENT</label>
                <textarea {...register("dent")} rows={4} className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50 resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">ANY OTHER VISIBLE OBSERVATION</label>
                <textarea {...register("anyOtherVisibleObservation")} rows={4} className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b21b6]/50 resize-none"></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card border-t border-border p-4 flex items-center justify-end gap-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            type="button"
            onClick={() => {
              setActionType("save");
              actionTypeRef.current = "save";
              handleSubmit(onSubmit)();
            }}
            disabled={saving}
            className="px-6 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {saving && actionType === "save" ? "Saving..." : "Save Changes"}
          </button>
          
          <button 
            type="button"
            onClick={() => {
              setActionType("send");
              actionTypeRef.current = "send";
              handleSubmit(onSubmit)();
            }}
            disabled={saving}
            className="px-6 py-2 bg-[#5b21b6] text-white font-medium rounded-lg hover:bg-[#5b21b6]/90 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            {saving && actionType === "send" ? "Processing..." : "Submit & Send PDF"}
          </button>
        </div>
      </form>
    </div>
  );
}