"use client";

import { useState, useEffect } from "react";
import { uploadCompanyLogo, getUserProfile, updateBusinessProfile, uploadSignature, uploadCompanyStamp } from "@/app/actions/user";
import { siteAssets } from "@/lib/site-assets";
import { Upload, Save, Building, MapPin, User as UserIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState("");
  const [selectedSignature, setSelectedSignature] = useState<File | null>(null);
  const [previewSignature, setPreviewSignature] = useState<string | null>(null);

  const [uploadingStamp, setUploadingStamp] = useState(false);
  const [stampError, setStampError] = useState("");
  const [selectedStamp, setSelectedStamp] = useState<File | null>(null);
  const [previewStamp, setPreviewStamp] = useState<string | null>(null);

  const [message, setMessage] = useState({ type: "", text: "", show: false });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getUserProfile().then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("File must be less than 2MB");
      return;
    }

    setLogoError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setLogoError("");

    try {
      const formData = new FormData();
      formData.append("logo", selectedFile);
      
      const res = await uploadCompanyLogo(formData);
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, companyLogo: res.url }));
        setSelectedFile(null);
        setPreviewUrl(null);
        router.refresh();
      }
    } catch (err: any) {
      setLogoError(err.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSignatureError("File must be less than 2MB");
      return;
    }
    setSignatureError("");
    setSelectedSignature(file);
    setPreviewSignature(URL.createObjectURL(file));
  };

  const handleUploadSignature = async () => {
    if (!selectedSignature) return;
    setUploadingSignature(true);
    setSignatureError("");
    try {
      const formData = new FormData();
      formData.append("signature", selectedSignature);
      const res = await uploadSignature(formData);
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, authorizedSignature: res.url }));
        setSelectedSignature(null);
        setPreviewSignature(null);
        router.refresh();
      }
    } catch (err: any) {
      setSignatureError(err.message || "Failed to upload signature");
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleStampFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStampError("File must be less than 2MB");
      return;
    }
    setStampError("");
    setSelectedStamp(file);
    setPreviewStamp(URL.createObjectURL(file));
  };

  const handleUploadStamp = async () => {
    if (!selectedStamp) return;
    setUploadingStamp(true);
    setStampError("");
    try {
      const formData = new FormData();
      formData.append("stamp", selectedStamp);
      const res = await uploadCompanyStamp(formData);
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, companyStamp: res.url }));
        setSelectedStamp(null);
        setPreviewStamp(null);
        router.refresh();
      }
    } catch (err: any) {
      setStampError(err.message || "Failed to upload stamp");
    } finally {
      setUploadingStamp(false);
    }
  };

  const validateInput = (name: string, value: string) => {
    let error = "";
    if (name === "mobileNumber" && value) {
      if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) error = "Must be a valid 10-digit number";
    }
    if (name === "pincode" && value) {
      if (!/^\d{6}$/.test(value)) error = "Must be a valid 6-digit pincode";
    }
    if (name === "panCardNumber" && value) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value)) error = "Invalid PAN format (e.g. ABCDE1234F)";
    }
    if (name === "gstNumber" && value) {
      // Basic 15 char check + structure check
      if (value.length !== 15 || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(value)) {
        error = "Invalid GST format (e.g. 22AAAAA0000A1Z5)";
      }
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Real-time validation for specific fields
    if (["mobileNumber", "pincode", "panCardNumber", "gstNumber"].includes(name)) {
      validateInput(name, value);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const mobile = formData.get("mobileNumber") as string;
    const pincode = formData.get("pincode") as string;
    const gst = formData.get("gstNumber") as string;
    const pan = formData.get("panCardNumber") as string;

    // Validate all before submit
    const isMobileValid = validateInput("mobileNumber", mobile);
    const isPincodeValid = validateInput("pincode", pincode);
    const isPanValid = validateInput("panCardNumber", pan);
    const isGstValid = validateInput("gstNumber", gst);

    if (!isMobileValid || !isPincodeValid || !isPanValid || !isGstValid) {
      // Don't show modal, errors are inline
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "", show: false });

    try {
      const res = await updateBusinessProfile(formData);
      if (res.success) {
        setMessage({ type: "success", text: "Business profile updated successfully!", show: true });
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile.", show: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  const isFreePlan = false; // Permanently unlocked for all users
  const p = profile?.profile || {};

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 relative">
      <div className="flex items-center justify-between bg-card py-3 px-4 sm:py-4 sm:px-6 rounded-xl shadow-sm border border-[#5b21b6]/20 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
      </div>
      
      {/* Modal for Success/Error Messages */}
      {message.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-lg p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setMessage({ ...message, show: false })}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${message.type === 'success' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
              {message.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-center mb-2 text-foreground">
              {message.type === 'success' ? 'Success' : 'Error'}
            </h3>
            <p className="text-center text-muted-foreground text-sm">
              {message.text}
            </p>
            <button 
              onClick={() => setMessage({ ...message, show: false })}
              className="mt-6 w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Base Account Details */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <UserIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Account Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Name</label>
            <p className="font-medium text-foreground">{profile?.name}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Login Email</label>
            <p className="font-medium text-foreground">{profile?.email}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Current Plan</label>
            <p className="font-medium text-primary">{profile?.planName}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Company Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name <span className="text-danger">*</span></label>
              <input required type="text" name="companyName" defaultValue={p.companyName || ""} className="w-full p-2 border border-border rounded-lg bg-background" placeholder="Tata Motors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Code <span className="text-danger">*</span></label>
              <input required type="text" name="companyCode" defaultValue={p.companyCode || ""} className="w-full p-2 border border-border rounded-lg bg-background" placeholder="TATA001" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner Name <span className="text-danger">*</span></label>
              <input required type="text" name="ownerName" defaultValue={p.ownerName || ""} className="w-full p-2 border border-border rounded-lg bg-background" placeholder="Rahul Kumar" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Email <span className="text-danger">*</span></label>
              <input required type="email" name="email" defaultValue={p.email || profile?.email || ""} className="w-full p-2 border border-border rounded-lg bg-background" placeholder="info@tatamotors.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile Number <span className="text-danger">*</span></label>
              <input 
                required 
                type="text" 
                name="mobileNumber" 
                maxLength={10}
                onChange={handleInputChange}
                defaultValue={p.mobileNumber || profile?.mobile || ""} 
                className={`w-full p-2 border rounded-lg bg-background ${fieldErrors.mobileNumber ? 'border-danger focus:ring-danger' : 'border-border'}`} 
                placeholder="9876543210" 
              />
              {fieldErrors.mobileNumber && <p className="text-xs text-danger mt-1">{fieldErrors.mobileNumber}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Number</label>
              <input 
                type="text" 
                name="gstNumber" 
                maxLength={15}
                onChange={handleInputChange}
                defaultValue={p.gstNumber || ""} 
                className={`w-full p-2 border rounded-lg bg-background uppercase ${fieldErrors.gstNumber ? 'border-danger focus:ring-danger' : 'border-border'}`} 
                placeholder="22AAAAA0000A1Z5" 
              />
              {fieldErrors.gstNumber && <p className="text-xs text-danger mt-1">{fieldErrors.gstNumber}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PAN Card Number</label>
              <input 
                type="text" 
                name="panCardNumber" 
                maxLength={10}
                onChange={handleInputChange}
                defaultValue={p.panCardNumber || ""} 
                className={`w-full p-2 border rounded-lg bg-background uppercase ${fieldErrors.panCardNumber ? 'border-danger focus:ring-danger' : 'border-border'}`} 
                placeholder="ABCDE1234F" 
              />
              {fieldErrors.panCardNumber && <p className="text-xs text-danger mt-1">{fieldErrors.panCardNumber}</p>}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Address Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Address Line 1 <span className="text-danger">*</span></label>
              <input required type="text" name="addressLine1" defaultValue={p.addressLine1 || ""} className="w-full p-2 border border-border rounded-lg bg-background" placeholder="M.G. Road" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Address Line 2</label>
              <input type="text" name="addressLine2" defaultValue={p.addressLine2 || ""} className="w-full p-2 border border-border rounded-lg bg-background" placeholder="Near City Center" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City <span className="text-danger">*</span></label>
              <input required type="text" name="city" defaultValue={p.city || ""} className="w-full p-2 border border-border rounded-lg bg-background" placeholder="Mumbai" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State <span className="text-danger">*</span></label>
              <input required type="text" name="state" defaultValue={p.state || ""} className="w-full p-2 border border-border rounded-lg bg-background" placeholder="Maharashtra" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pincode <span className="text-danger">*</span></label>
              <input 
                required 
                type="text" 
                name="pincode" 
                maxLength={6}
                onChange={handleInputChange}
                defaultValue={p.pincode || ""} 
                className={`w-full p-2 border rounded-lg bg-background ${fieldErrors.pincode ? 'border-danger focus:ring-danger' : 'border-border'}`} 
                placeholder="400001" 
              />
              {fieldErrors.pincode && <p className="text-xs text-danger mt-1">{fieldErrors.pincode}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <input type="text" name="country" defaultValue={p.country || ""} className="w-full p-2 border border-border rounded-lg bg-background" placeholder="India" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Business Profile"}
          </button>
        </div>
      </form>

      {/* Company Logo Upload */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Company Logo</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Customize your documents by uploading your company logo.
          </p>
          
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-48 h-24 border rounded-lg flex items-center justify-center bg-background overflow-hidden p-2">
              <img 
                src={previewUrl || ((!isFreePlan && profile?.companyLogo) ? profile.companyLogo : siteAssets.logo)} 
                alt="Logo Preview" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            <div className="flex-1 space-y-4">
              {isFreePlan ? (
                <div className="p-4 bg-muted rounded-lg border">
                  <p className="text-sm font-medium text-muted-foreground">
                    Custom logos are only available on Trial or Paid plans. Please upgrade your subscription to unlock this feature.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20 disabled:opacity-50"
                  />
                  
                  {selectedFile && (
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </button>
                  )}
                  
                  {logoError && <p className="text-sm text-danger">{logoError}</p>}
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 200x60 pixels. Max file size: 2MB.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signature and Stamp Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authorized Signature Upload */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Authorized Signature</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload an image of your signature to automatically apply it to documents.
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <div className="w-full h-32 border rounded-lg flex items-center justify-center bg-background overflow-hidden p-2">
                <img 
                  src={previewSignature || profile?.authorizedSignature || "https://placehold.co/400x200?text=Signature"} 
                  alt="Signature Preview" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              <div className="w-full space-y-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleSignatureFileChange}
                  disabled={uploadingSignature}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20 disabled:opacity-50"
                />
                
                {selectedSignature && (
                  <button
                    onClick={handleUploadSignature}
                    disabled={uploadingSignature}
                    className="flex w-full justify-center items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingSignature ? "Uploading..." : "Upload Signature"}
                  </button>
                )}
                
                {signatureError && <p className="text-sm text-danger">{signatureError}</p>}
                <p className="text-xs text-muted-foreground text-center">
                  Max file size: 2MB. Transparent PNG recommended.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Stamp Upload */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Company Stamp</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload an image of your company stamp/seal.
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <div className="w-full h-32 border rounded-lg flex items-center justify-center bg-background overflow-hidden p-2">
                <img 
                  src={previewStamp || profile?.companyStamp || "https://placehold.co/200x200?text=Stamp"} 
                  alt="Stamp Preview" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              <div className="w-full space-y-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleStampFileChange}
                  disabled={uploadingStamp}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20 disabled:opacity-50"
                />
                
                {selectedStamp && (
                  <button
                    onClick={handleUploadStamp}
                    disabled={uploadingStamp}
                    className="flex w-full justify-center items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingStamp ? "Uploading..." : "Upload Stamp"}
                  </button>
                )}
                
                {stampError && <p className="text-sm text-danger">{stampError}</p>}
                <p className="text-xs text-muted-foreground text-center">
                  Max file size: 2MB. Transparent PNG recommended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}