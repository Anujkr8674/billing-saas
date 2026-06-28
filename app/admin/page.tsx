"use client";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { siteAssets } from "@/lib/site-assets";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password required"),
});

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to login");
      
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-2xl border border-danger/20 shadow-[0_0_40px_-15px_rgba(239,68,68,0.2)] p-8">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6">
             <img src={siteAssets.logo} alt="NextGen Billing Logo" className="h-12" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Administrative Access</p>
        </div>

        {error && <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg text-sm">{error}</div>}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Admin Email</label>
            <input 
              {...form.register("email")}
              type="email" 
              className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-danger focus:border-transparent transition-all"
              placeholder="admin@nextgenbilling.com"
            />
            {form.formState.errors.email && <p className="text-danger text-xs mt-1">{form.formState.errors.email.message?.toString()}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input 
              {...form.register("password")}
              type="password" 
              className="w-full px-4 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-danger focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            {form.formState.errors.password && <p className="text-danger text-xs mt-1">{form.formState.errors.password.message?.toString()}</p>}
          </div>

          <button disabled={loading} type="submit" className="w-full mt-6 bg-danger text-danger-foreground font-bold py-3 rounded-xl hover:bg-danger/90 transition-colors shadow-lg shadow-danger/20 disabled:opacity-50">
            {loading ? "Authenticating..." : "Secure Login"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Return to main site</Link>
        </div>
      </div>
    </div>
  );
}
