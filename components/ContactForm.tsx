"use client";

import { useState } from "react";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      contactNo: formData.get("contactNo") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    const res = await submitContactForm(data);
    
    if (res.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(res.error || "Failed to submit form");
    }
    
    setLoading(false);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSuccess(false)}
          ></div>
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 max-w-sm w-full relative z-10 animate-in zoom-in-95 fade-in duration-300 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
            <p className="text-slate-600 mb-8">
              Thanks for reaching out! We'll get back to you shortly. A confirmation email has been sent to your inbox.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 font-medium">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900">First Name</label>
          <input name="firstName" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="John" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900">Last Name</label>
          <input name="lastName" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Doe" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900">Email Address</label>
          <input name="email" required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="john@company.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900">Contact Number</label>
          <input name="contactNo" required type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="+91 9876543210" />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900">Subject</label>
        <select name="subject" required defaultValue="" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none text-slate-900">
          <option value="" disabled>Select a subject</option>
          <option value="General Inquiry">General Inquiry</option>
          <option value="Pricing / Quote">Pricing / Quote</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900">Message</label>
        <textarea name="message" required rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none" placeholder="How can we help you?"></textarea>
      </div>
      
      <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-4 disabled:opacity-70">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Message <MessageSquare className="w-5 h-5" /></>}
      </button>
    </form>
  );
}
