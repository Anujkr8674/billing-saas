"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Zap, FileSignature, ShieldCheck, Mail, LineChart, Package, Truck, Printer, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function FeaturesPage() {
  const HERO_TEXTS = [
    "Bill Smarter",
    "Scale Faster",
    "Automate Everything"
  ];

  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  useEffect(() => {
    const currentText = HERO_TEXTS[textIndex];
    let timeoutId: NodeJS.Timeout;

    if (!isDeleting && displayedText === currentText) {
      // Pause at the end of typing
      timeoutId = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayedText === "") {
      // Move to next word when fully deleted
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % HERO_TEXTS.length);
    } else {
      // Type or delete characters
      const nextDelay = isDeleting ? 50 : 100;
      timeoutId = setTimeout(() => {
        setDisplayedText((prev) =>
          isDeleting
            ? currentText.substring(0, prev.length - 1)
            : currentText.substring(0, prev.length + 1)
        );
      }, nextDelay);
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isDeleting, textIndex]);
  const features = [
    {
      title: "1-Click PDF Generation",
      description: "Create flawless, print-ready A4 PDFs instantly without any complex formatting required on your end. Ideal for fast-paced logistics.",
      icon: <Printer className="w-8 h-8 text-rose-500" />
    },
    {
      title: "Direct Email Delivery",
      description: "Send Invoices and Quotations directly to your clients from within the dashboard. Track sending status and read receipts effortlessly.",
      icon: <Mail className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Custom Branding & E-Signature",
      description: "Every document automatically embeds your company logo, official stamp, and authorized signature. Look professional instantly.",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />
    },
    {
      title: "Comprehensive Analytics",
      description: "Beautiful, interactive charts show your revenue trends, outstanding payments, and document volume over time.",
      icon: <LineChart className="w-8 h-8 text-purple-500" />
    },
    {
      title: "Lorry Receipts & Loading Slips",
      description: "Specialized document formats built ground-up for packers, movers, and transport fleets. Don't settle for generic invoice software.",
      icon: <Truck className="w-8 h-8 text-amber-500" />
    },
    {
      title: "Instant Quotations",
      description: "Convert leads faster by generating and sending professional quotes in under 30 seconds from your phone or desktop.",
      icon: <Zap className="w-8 h-8 text-sky-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-24 pb-16 px-6 text-center bg-white relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight min-h-[140px] md:min-h-[160px]">
              Everything You Need to <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {displayedText}<span className="text-primary animate-pulse inline-block ml-1">|</span>
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto mt-4 md:mt-0">
              Purpose-built tools designed to eliminate paperwork, automate formatting, and help logistics businesses get paid faster.
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Core Capabilities</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Explore the powerful features that make our platform the #1 choice for transport professionals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                onClick={() => setSelectedFeature(feature)}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 bg-indigo-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">Go from zero to a professional PDF in under 60 seconds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-800"></div>

              <div className="relative text-center z-10 group cursor-pointer">
                <div className="w-16 h-16 mx-auto bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center text-xl font-bold text-white mb-6 shadow-xl group-hover:-translate-y-2 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary/30 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-500 ease-out">1</div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-500">Setup Profile</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-500">Upload your company logo, authorized signature, and tax details once.</p>
              </div>
              
              <div className="relative text-center z-10 group cursor-pointer">
                <div className="w-16 h-16 mx-auto bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center text-xl font-bold text-white mb-6 shadow-xl group-hover:-translate-y-2 group-hover:scale-110 group-hover:bg-accent group-hover:border-accent/30 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all duration-500 ease-out">2</div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors duration-500">Draft Document</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-500">Fill out an intuitive, fast form with your line items and client info.</p>
              </div>
              
              <div className="relative text-center z-10 group cursor-pointer">
                <div className="w-16 h-16 mx-auto bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center text-xl font-bold text-white mb-6 shadow-xl group-hover:-translate-y-2 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-500 ease-out">3</div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-400 transition-colors duration-500">Generate & Send</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-500">Download a pristine A4 PDF or email it directly to the client.</p>
              </div>
            </div>
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

      {/* Feature Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedFeature(null)}
          ></div>
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 max-w-lg w-full relative z-10 animate-in zoom-in-95 fade-in duration-300">
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6">
              {selectedFeature.icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{selectedFeature.title}</h3>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              {selectedFeature.description}
            </p>
            <Link
              href="/signup"
              className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Try it now <Zap className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
