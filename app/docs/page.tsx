import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Code, Settings, Shield, Truck, MapPin, Receipt, Users, Database, FileText } from "lucide-react";

export default function DocumentationPage() {
  const categories = [
    { title: "Getting Started", icon: BookOpen, desc: "Account setup, organization profile, and initial configurations." },
    { title: "Fleet Management", icon: Truck, desc: "Adding vehicles, tracking maintenance, and managing fuel logs." },
    { title: "Lorry Receipts (LR)", icon: Receipt, desc: "Generating, customizing, and sharing digital Lorry Receipts." },
    { title: "Driver Management", icon: Users, desc: "Driver profiles, assignment, and Proof of Delivery (POD) workflows." },
    { title: "Trip & Dispatch", icon: MapPin, desc: "Creating routes, scheduling dispatches, and toll tracking." },
    { title: "Invoicing & Taxes", icon: FileText, desc: "Automated invoicing, multi-state GST rules, and e-Way Bills." },
    { title: "Advanced Settings", icon: Settings, desc: "Custom fields, webhook configurations, and data export." },
    { title: "API Reference", icon: Code, desc: "REST API endpoints for headless integrations and custom apps." },
    { title: "Security & Access", icon: Shield, desc: "Role-Based Access Control (RBAC) and audit logs." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-slate-900 rounded-3xl p-12 md:p-20 text-center text-white mb-20 relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-primary/20 blur-[100px] rounded-full mix-blend-screen"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen"></div>
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Documentation Portal</h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
                Everything you need to master NextGen Billing. From setting up your first fleet to automating complex enterprise workflows.
              </p>
              
              <div className="max-w-2xl mx-auto relative">
                <input 
                  type="text" 
                  placeholder="Search for guides, API endpoints, or features..." 
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-2xl py-5 px-6 pl-14 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/20 transition-all backdrop-blur-md"
                />
                <svg className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <div key={idx} className={`bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer group animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both delay-${(idx % 3) * 150}`}>
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:-translate-y-2 transition-all duration-300">
                  <cat.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{cat.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">{cat.desc}</p>
                <div className="flex items-center text-primary font-bold text-sm">
                  Explore Docs <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
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
