"use client";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { siteAssets } from "@/lib/site-assets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to login");
      
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
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg p-8">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6">
            <img src={siteAssets.logo} alt="NextGen Billing Logo" className="h-12" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
        </div>

        {error && <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg text-sm">{error}</div>}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
            <input 
              {...form.register("email")}
              type="email" 
              className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
            {form.formState.errors.email && <p className="text-danger text-xs mt-1">{form.formState.errors.email.message?.toString()}</p>}
          </div>
          <div>
             <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-medium text-foreground">Password</label>
               <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80">Forgot password?</Link>
             </div>
            <input 
              {...form.register("password")}
              type="password" 
              className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            {form.formState.errors.password && <p className="text-danger text-xs mt-1">{form.formState.errors.password.message?.toString()}</p>}
          </div>

          <button disabled={loading} type="submit" className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-8 text-muted-foreground text-sm">
          Don't have an account? <Link href="/signup" className="font-bold text-primary hover:underline">Sign up for free</Link>
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-success" /> Secure 256-bit encryption
      </div>
    </div>
  );
}
