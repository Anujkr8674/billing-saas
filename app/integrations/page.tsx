import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link2, Truck, Droplet, CarFront, Calculator, MessageSquare, Database, BarChart3, Cloud, Briefcase } from "lucide-react";

export default function IntegrationsPage() {
  const categories = [
    {
      title: "Telematics & GPS Tracking",
      items: [
        { name: "LocoNav", desc: "Real-time vehicle tracking and analytics", icon: Truck, delay: "delay-100" },
        { name: "Letstrack", desc: "Advanced fleet management and GPS", icon: Truck, delay: "delay-150" },
        { name: "Fleetx", desc: "AI-driven fleet management system", icon: CarFront, delay: "delay-200" },
      ]
    },
    {
      title: "Fuel & Expenses",
      items: [
        { name: "HP DriveTrack Plus", desc: "Automate fuel expense tracking", icon: Droplet, delay: "delay-[250ms]" },
        { name: "BPCL SmartFleet", desc: "Direct sync for fleet fuel cards", icon: Droplet, delay: "delay-300" },
        { name: "Fastag Providers", desc: "Automatic toll deduction syncing", icon: CarFront, delay: "delay-[350ms]" },
      ]
    },
    {
      title: "Accounting & ERP",
      items: [
        { name: "Tally ERP", desc: "One-click invoice export to Tally", icon: Calculator, delay: "delay-[400ms]" },
        { name: "Zoho Books", desc: "Two-way accounting synchronization", icon: Calculator, delay: "delay-[450ms]" },
        { name: "SAP ERP", desc: "Enterprise-level data integration", icon: Briefcase, delay: "delay-[500ms]" },
      ]
    },
    {
      title: "Communication & Analytics",
      items: [
        { name: "WhatsApp Business", desc: "Send automated Lorry Receipts", icon: MessageSquare, delay: "delay-[550ms]" },
        { name: "Slack", desc: "Internal team notifications", icon: MessageSquare, delay: "delay-[600ms]" },
        { name: "Tableau", desc: "Advanced data visualization", icon: BarChart3, delay: "delay-[650ms]" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tight">Powerful Integrations</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Connect NextGen Billing seamlessly with the tools and platforms your logistics business already relies on. Supercharge your operations from dispatch to delivery.
            </p>
          </div>
          
          <div className="space-y-20">
            {categories.map((category, catIdx) => (
              <div key={catIdx} className="animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both" style={{ animationDelay: `${catIdx * 150}ms` }}>
                <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">{category.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.items.map((item, idx) => (
                    <div key={idx} className={`bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group animate-in zoom-in-95 fade-in ${item.delay}`}>
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                        <item.icon className="w-8 h-8 text-slate-700 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{item.name}</h3>
                      <p className="text-slate-600 mb-8 leading-relaxed">{item.desc}</p>
                      <div className="flex items-center text-primary font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                        <Link2 className="w-5 h-5 mr-2" /> Connect App
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA Section */}
          <div className="mt-24 bg-slate-900 rounded-3xl p-12 text-center text-white animate-in zoom-in-95 fade-in duration-700 delay-1000">
            <h2 className="text-3xl font-bold mb-4">Don't see your favorite tool?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
              We are constantly adding new integrations to our ecosystem. Use our robust REST API to build custom connections or request a new integration.
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors">Request Integration</button>
              <button className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20">View API Docs</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
