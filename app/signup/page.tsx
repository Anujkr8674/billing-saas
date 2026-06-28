"use client";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { siteAssets } from "@/lib/site-assets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Invalid mobile number"),
});

const verifySchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const registerForm = useForm({ resolver: zodResolver(registerSchema) });
  const verifyForm = useForm({ resolver: zodResolver(verifySchema) });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onRegister = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send OTP");
      
      setUserId(result.userId);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: data.otp }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Invalid OTP");
      
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onPassword = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/create-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create account");
      
      router.push("/user");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center justify-center mb-8">
        <img src={siteAssets.logo} alt="NextGen Billing Logo" className="h-12" />
      </Link>
      
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {step === 1 ? "Create an Account" : step === 2 ? "Verify Email" : "Set Password"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 1 ? "Start your free trial. No credit card required." : step === 2 ? "Enter the 6-digit code sent to your email." : "Secure your account."}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg text-sm">{error}</div>}

        {step === 1 && (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <input 
                {...registerForm.register("name")}
                type="text" 
                className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="John Doe"
              />
              {registerForm.formState.errors.name && <p className="text-danger text-xs mt-1">{registerForm.formState.errors.name.message?.toString()}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
              <input 
                {...registerForm.register("email")}
                type="email" 
                className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
              {registerForm.formState.errors.email && <p className="text-danger text-xs mt-1">{registerForm.formState.errors.email.message?.toString()}</p>}
            </div>
            <div>
               <label className="block text-sm font-medium text-foreground mb-1">Mobile Number</label>
              <input 
                {...registerForm.register("mobile")}
                type="tel" 
                className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="+91 9999999999"
              />
              {registerForm.formState.errors.mobile && <p className="text-danger text-xs mt-1">{registerForm.formState.errors.mobile.message?.toString()}</p>}
            </div>

            <button disabled={loading} type="submit" className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyForm.handleSubmit(onVerify)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">OTP Code</label>
              <input 
                {...verifyForm.register("otp")}
                type="text" 
                maxLength={6}
                className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest text-lg font-bold"
                placeholder="123456"
              />
            </div>
            <button disabled={loading} type="submit" className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={passwordForm.handleSubmit(onPassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Create Password</label>
              <input 
                {...passwordForm.register("password")}
                type="password" 
                className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            <button disabled={loading} type="submit" className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
              {loading ? "Creating Account..." : "Create Account & Login"}
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="text-center mt-8 text-muted-foreground text-sm">
            Already have an account? <Link href="/login" className="font-bold text-primary hover:underline">Log in</Link>
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-success" /> Secure 256-bit encryption
      </div>
    </div>
  );
}
