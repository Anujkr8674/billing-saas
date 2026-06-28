import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Star, Zap, ShieldCheck } from "lucide-react";

export default function ChangelogPage() {
  const logs = [
    { 
      version: "v2.5.0", 
      date: "June 15, 2026", 
      badge: "Latest Release",
      desc: "Massive updates to our core logistics engine focusing on automation and compliance.",
      changes: [
        { icon: Zap, text: "Automated Lorry Receipt generation based on dispatch schedules." },
        { icon: ShieldCheck, text: "Introduced advanced granular Role-Based Access Control (RBAC) for warehouse staff." },
        { icon: CheckCircle2, text: "Bulk vehicle document expiration alerts directly to WhatsApp." },
        { icon: CheckCircle2, text: "Improved PDF export rendering engine, increasing speed by 40%." },
      ]
    },
    { 
      version: "v2.4.2", 
      date: "May 28, 2026", 
      desc: "Minor feature enhancements and bug squashing.",
      changes: [
        { icon: CheckCircle2, text: "Fixed an issue where multi-state GST calculation was rounding incorrectly." },
        { icon: CheckCircle2, text: "Added support for LocoNav API v3." },
        { icon: CheckCircle2, text: "Resolved UI glitch in the driver assignment dashboard." },
      ]
    },
    { 
      version: "v2.4.0", 
      date: "May 10, 2026", 
      desc: "The Fleet Analytics Update.",
      changes: [
        { icon: Star, text: "Brand new Fleet Analytics Dashboard with heatmaps and utilization metrics." },
        { icon: Zap, text: "Added custom reporting builder." },
        { icon: CheckCircle2, text: "Optimized database queries for accounts with over 100,000 trips." },
        { icon: ShieldCheck, text: "Enhanced audit logs to track field-level modifications." },
      ]
    },
    { 
      version: "v2.3.0", 
      date: "April 02, 2026", 
      desc: "Driver app improvements and new accounting integrations.",
      changes: [
        { icon: Zap, text: "Two-way sync capabilities with Zoho Books and Tally Prime." },
        { icon: CheckCircle2, text: "Driver mobile view optimization for Proof of Delivery (POD) uploads." },
        { icon: CheckCircle2, text: "Added support for partial toll payments via Fastag integration." },
        { icon: CheckCircle2, text: "Customizable invoice templates." },
      ]
    },
    { 
      version: "v2.2.5", 
      date: "March 15, 2026", 
      desc: "Security and compliance update.",
      changes: [
        { icon: ShieldCheck, text: "Enforced Two-Factor Authentication (2FA) for admin roles." },
        { icon: CheckCircle2, text: "Added e-Way Bill generation directly from Lorry Receipts." },
        { icon: CheckCircle2, text: "Fixed timezone synchronization issue for cross-country trips." },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        
        {/* Premium Header */}
        <div className="bg-slate-950 py-24 md:py-32 relative overflow-hidden">
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
          {/* Glowing orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">What's New</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              New updates and improvements to NextGen Billing.
            </p>
          </div>
        </div>
        
        {/* Timeline Content */}
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="relative border-l border-slate-200 ml-4 md:ml-8 space-y-32">
            
            {logs.map((log, idx) => (
              <div key={idx} className={`relative pl-8 md:pl-16 group animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both delay-${(idx % 4) * 150}`}>
                
                {/* Glowing Dot on Timeline */}
                <div className="absolute -left-[9px] top-2 flex items-center justify-center w-4 h-4 rounded-full bg-white border-[3px] border-primary shadow-[0_0_12px_rgba(139,92,246,0.6)] z-10 group-hover:scale-150 group-hover:bg-primary transition-all duration-500">
                </div>
                
                {/* Content Header */}
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <time className="text-sm font-bold tracking-widest uppercase text-slate-400">{log.date}</time>
                    {log.badge && (
                      <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{log.badge}</span>
                    )}
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-primary transition-colors duration-300">
                    NextGen {log.version}
                  </h2>
                  <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
                    {log.desc}
                  </p>
                </div>
                
                {/* Feature List Box */}
                <div className="bg-slate-50/50 rounded-3xl p-8 md:p-10 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-300">
                  <ul className="space-y-6">
                    {log.changes.map((change, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-4 group/item">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:shadow-md transition-shadow">
                          <change.icon className={`w-5 h-5 ${change.icon === Zap ? 'text-amber-500' : change.icon === ShieldCheck ? 'text-blue-500' : change.icon === Star ? 'text-purple-500' : 'text-emerald-500'}`} />
                        </div>
                        <span className="text-lg text-slate-700 leading-relaxed pt-1.5">{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
