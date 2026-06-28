import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";
import AnimatedCounter from "@/components/AnimatedCounter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="pt-24 pb-20 px-6 text-center bg-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
           
           <div className="max-w-3xl mx-auto relative z-10">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Modernizing Logistics <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">One Document at a Time</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                We built NextGen Billing because we saw transport fleets, packers, and movers struggling with generic invoicing software that didn't understand their unique needs.
              </p>
           </div>
        </section>

        {/* Mission and Values */}
        <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Logistics is the backbone of the economy, yet the software powering it is often stuck in the past. Our mission is to democratize enterprise-grade billing for businesses of all sizes.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Whether you're a freelance driver or a fleet operator, you deserve tools that make you look professional, save you hours of administrative work, and help you get paid faster.
              </p>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:-translate-y-2 hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">Hyper-Focused</h4>
                <p className="text-slate-600 text-sm">We only build for logistics. We know exactly what a Lorry Receipt needs to look like.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:-translate-y-2 hover:shadow-xl hover:border-amber-500/40 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-amber-500/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-500/10 transition-all duration-300">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">Blazing Fast</h4>
                <p className="text-slate-600 text-sm">Time is money. Our platform generates complex PDFs in milliseconds.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:-translate-y-2 hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-300">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Rock Solid</h4>
                <p className="text-slate-600 text-sm">Enterprise-grade security ensures your financial data is always safe.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:-translate-y-2 hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-blue-500/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-300">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Customer First</h4>
                <p className="text-slate-600 text-sm">24/7 support because the transport industry never sleeps.</p>
              </div>
           </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 bg-indigo-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
                <AnimatedCounter end={10000} suffix="+" />
              </div>
              <div className="text-slate-400 font-medium">Active Businesses</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-accent mb-2">
                <AnimatedCounter end={500} prefix="₹" suffix=" Cr+" />
              </div>
              <div className="text-slate-400 font-medium">Invoices Processed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">
                <AnimatedCounter end={99.9} decimals={1} suffix="%" />
              </div>
              <div className="text-slate-400 font-medium">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-amber-400 mb-2">
                <AnimatedCounter end={24} suffix="/7" />
              </div>
              <div className="text-slate-400 font-medium">Dedicated Support</div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl transform rotate-3 scale-105"></div>
            <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Team working" className="relative rounded-3xl shadow-2xl object-cover h-[400px] w-full" />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              It started with a simple observation: transport companies were using Word documents and basic spreadsheets to manage millions of dollars in freight. The process was slow, error-prone, and frustrating.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              We assembled a team of logistics experts and top-tier engineers to build a solution from the ground up. Today, NextGen Billing is the trusted partner for thousands of logistics professionals, helping them scale without the administrative headache.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary via-[#4f46e5] to-accent rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to upgrade your billing?</h2>
              <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of packers and movers who trust NextGen Billing for their daily operations.
              </p>
              <Link href="/signup" className="inline-flex px-10 py-5 bg-white text-primary text-xl font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl items-center gap-2">
                Start Your Free Plan <Zap className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
