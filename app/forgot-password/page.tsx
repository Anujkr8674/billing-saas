"use client";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { siteAssets } from "@/lib/site-assets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm({ resolver: zodResolver(resetSchema) });

  const onEmailSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send OTP");
      
      setEmail(data.email);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: data.otp, newPassword: data.newPassword }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to reset password");
      
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg p-8 relative overflow-hidden">
        <div className="flex justify-center mb-2">
          <Link href="/">
            <img src={siteAssets.logo} alt="NextGen Billing Logo" className="h-12" />
          </Link>
        </div>
        
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8 flex flex-col items-center">
              <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
              <p className="text-muted-foreground mt-2">Enter your email to receive a password reset OTP</p>
            </div>

            {error && <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg text-sm">{error}</div>}

            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                <input 
                  {...emailForm.register("email")}
                  type="email" 
                  className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
                {emailForm.formState.errors.email && <p className="text-danger text-xs mt-1">{emailForm.formState.errors.email.message?.toString()}</p>}
              </div>

              <button disabled={loading} type="submit" className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>

            <Link href="/login" className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
              <p className="text-muted-foreground mt-2">Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span></p>
            </div>

            {error && <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg text-sm">{error}</div>}

            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Verification Code</label>
                <input 
                  {...resetForm.register("otp")}
                  type="text" 
                  maxLength={6}
                  className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all tracking-[0.5em] text-center font-mono text-lg"
                  placeholder="••••••"
                />
                {resetForm.formState.errors.otp && <p className="text-danger text-xs mt-1">{resetForm.formState.errors.otp.message?.toString()}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
                <input 
                  {...resetForm.register("newPassword")}
                  type="password" 
                  className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                {resetForm.formState.errors.newPassword && <p className="text-danger text-xs mt-1">{resetForm.formState.errors.newPassword.message?.toString()}</p>}
              </div>

              <button disabled={loading} type="submit" className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
            
            <button onClick={() => setStep(1)} className="w-full flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
               Use a different email
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-8">
             <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
             </div>
             <h1 className="text-2xl font-bold text-foreground mb-2">Password Reset!</h1>
             <p className="text-muted-foreground mb-8">Your password has been successfully updated. You can now log in with your new password.</p>
             
             <Link href="/login" className="w-full block bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Go to Login
             </Link>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-success" /> Secure 256-bit encryption
      </div>
    </div>
  );
}
