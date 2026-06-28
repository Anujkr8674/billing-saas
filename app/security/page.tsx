import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Server, Key, Eye, FileDigit, Activity } from "lucide-react";

export default function SecurityPage() {
  const features = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      desc: "All data transmitted between your browser and our servers is encrypted using industry-standard TLS 1.3. Data at rest is secured using AES-256 encryption, ensuring your financial and fleet data remains entirely confidential.",
      color: "emerald"
    },
    {
      icon: Server,
      title: "Enterprise Cloud Infrastructure",
      desc: "Our platform is hosted on world-class AWS infrastructure. We utilize multiple availability zones, automatic failovers, and isolated VPCs to guarantee 99.99% uptime for your logistics operations.",
      color: "blue"
    },
    {
      icon: Shield,
      title: "Regulatory Compliance",
      desc: "We adhere strictly to global and regional data protection regulations. Our systems are built to be compliant with GDPR standards, and we undergo regular third-party SOC 2 Type II audits.",
      color: "purple"
    },
    {
      icon: Key,
      title: "Granular Access Control (RBAC)",
      desc: "Define exactly who sees what. Our Role-Based Access Control allows you to restrict sensitive financial data to administrators, while giving dispatchers only the tools they need.",
      color: "amber"
    },
    {
      icon: Eye,
      title: "Comprehensive Audit Logs",
      desc: "Every action taken on the platform—from generating an invoice to modifying a driver's profile—is permanently logged with timestamps and user IDs, ensuring complete accountability.",
      color: "rose"
    },
    {
      icon: FileDigit,
      title: "Automated Data Backups",
      desc: "Your data is automatically backed up across multiple geographically distributed data centers every hour. In the event of a disaster, our recovery time objective (RTO) is near-instantaneous.",
      color: "cyan"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-6">
              <Shield className="w-6 h-6 text-emerald-600 mr-2" />
              <span className="text-emerald-700 font-bold text-sm tracking-widest uppercase pr-2">Enterprise Security</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tight">Security you can trust.</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We know that your logistics and billing data is the lifeblood of your business. We've built NextGen Billing with military-grade security from the ground up so you never have to worry.
            </p>
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-3xl p-10 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group animate-in zoom-in-95 fade-in duration-700 fill-mode-both delay-${(idx % 3) * 150}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 bg-${feat.color}-100 text-${feat.color}-600`}>
                  <feat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">{feat.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Real-time Status */}
          <div className="mt-24 bg-slate-900 rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl overflow-hidden relative animate-in fade-in slide-in-from-bottom-12 duration-700 delay-1000">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>
            <div className="relative z-10 md:w-2/3 mb-8 md:mb-0">
              <h3 className="text-3xl font-bold mb-4">System Status: All Systems Operational</h3>
              <p className="text-slate-400 text-lg">Our dedicated security team monitors the platform 24/7/365 to prevent threats before they happen. Current uptime is 99.99% over the last 90 days.</p>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 py-4 px-6 rounded-2xl backdrop-blur-sm">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
                <span className="font-bold tracking-wider uppercase text-sm">Real-time Monitoring Active</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
