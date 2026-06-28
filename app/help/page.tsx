import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plus, Search, MessageCircle } from "lucide-react";

export default function HelpCenterPage() {
  const faqs = [
    { 
      q: "How do I reset my admin password?", 
      a: "If you are an administrator, you can reset your password by clicking on 'Forgot Password' on the login screen. An OTP will be sent to your registered email address to verify your identity before allowing a reset." 
    },
    { 
      q: "Can I generate Lorry Receipts (LR) in bulk?", 
      a: "Yes! Our platform supports bulk LR generation. Simply navigate to the Lorry Receipts section on your dashboard, click on 'Bulk Import', and upload your standard CSV template. The system will automatically validate and generate the receipts." 
    },
    { 
      q: "How are multi-state taxes calculated?", 
      a: "NextGen Billing comes with a built-in tax engine that automatically determines IGST, CGST, and SGST based on the origin and destination addresses provided in the trip details. You can override these in the Advanced Settings if needed." 
    },
    { 
      q: "Can I assign multiple drivers to a single trip?", 
      a: "Absolutely. In the Dispatch section, you can add a primary driver and a co-driver to any trip. Both drivers will receive SMS notifications and will be able to access the trip details on their mobile devices." 
    },
    { 
      q: "Is my logistics data secure?", 
      a: "Yes. We use AES-256 bank-level encryption to secure all data at rest and TLS 1.3 for data in transit. We are hosted on enterprise-grade AWS servers with strict access controls to ensure your business data is never compromised." 
    },
    { 
      q: "How do I customize the invoice template with my logo?", 
      a: "Go to Admin Dashboard > Organization Profile > Invoice Settings. There, you can upload your company logo, change the primary color scheme, and add custom footer notes (such as banking details or terms and conditions) that will appear on every invoice." 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 py-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tight">How can we help?</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
              Search our knowledge base or browse the frequently asked questions below to find answers about NextGen Billing.
            </p>
            
            <div className="relative max-w-2xl mx-auto shadow-xl rounded-2xl animate-in zoom-in-95 duration-700 delay-300">
              <input 
                type="text" 
                placeholder="Search for articles, guides, or FAQs..." 
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl py-5 px-6 pl-14 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg"
              />
              <Search className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 animate-in fade-in duration-700 delay-500">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className={`bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-${(idx % 6) * 150 + 500}`}>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">{faq.q}</h3>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <Plus className="w-4 h-4 text-slate-600 group-hover:text-primary" />
                    </div>
                  </div>
                  <p className="text-slate-600 mt-4 leading-relaxed pr-8">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-20 bg-primary/5 border border-primary/10 rounded-3xl p-10 text-center animate-in fade-in zoom-in-95 duration-700 delay-1000">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Still need help?</h3>
            <p className="text-slate-600 mb-8 max-w-lg mx-auto">
              Can't find the answer you're looking for? Our dedicated support team is available 24/7 to assist you with any issues.
            </p>
            <button className="bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
              Contact Support
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
