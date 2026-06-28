import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Clock, User, Calendar } from "lucide-react";

export default function LogisticsGuidesPage() {
  const guides = [
    { 
      title: "Mastering Lorry Receipts: A Complete Guide", 
      excerpt: "Learn how to digitize your Lorry Receipts (LRs), reduce manual errors, and ensure legal compliance across state borders.",
      category: "Operations", 
      time: "8 min read",
      author: "Rajesh Kumar",
      date: "Jun 12, 2026",
      image: "bg-blue-500"
    },
    { 
      title: "Navigating Multi-State GST for Transport", 
      excerpt: "A deep dive into how Goods and Services Tax applies to logistics companies operating across multiple regions in India.",
      category: "Compliance", 
      time: "12 min read",
      author: "Priya Sharma",
      date: "May 29, 2026",
      image: "bg-emerald-500"
    },
    { 
      title: "Strategies to Reduce DSO (Days Sales Outstanding)", 
      excerpt: "Unpaid invoices strangle cash flow. Discover actionable strategies to collect payments faster from shippers and clients.",
      category: "Finance", 
      time: "6 min read",
      author: "Amit Patel",
      date: "May 15, 2026",
      image: "bg-amber-500"
    },
    { 
      title: "Preventative Fleet Maintenance Protocols", 
      excerpt: "How to use software to track vehicle health, schedule maintenance, and prevent costly on-road breakdowns.",
      category: "Fleet Management", 
      time: "10 min read",
      author: "Rajesh Kumar",
      date: "Apr 22, 2026",
      image: "bg-purple-500"
    },
    { 
      title: "Automating Toll & Fuel Expense Tracking", 
      excerpt: "Stop chasing physical receipts. Learn how to integrate Fastag and Fuel Cards directly into your billing software.",
      category: "Automation", 
      time: "7 min read",
      author: "Vikram Singh",
      date: "Apr 05, 2026",
      image: "bg-rose-500"
    },
    { 
      title: "Transitioning Your Team to Digital Pods", 
      excerpt: "Change management tips for getting your truck drivers comfortable with uploading Proof of Delivery via mobile apps.",
      category: "Leadership", 
      time: "9 min read",
      author: "Priya Sharma",
      date: "Mar 18, 2026",
      image: "bg-cyan-500"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tight">Logistics Guides & Insights</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Expert articles, case studies, and industry best practices for scaling your transport business in the digital age.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {guides.map((guide, idx) => (
              <div key={idx} className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col group animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both delay-${(idx % 3) * 150}`}>
                {/* Decorative Image Area */}
                <div className={`h-48 w-full ${guide.image} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-full">{guide.category}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors leading-tight">{guide.title}</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed flex-1">{guide.excerpt}</p>
                  
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs font-semibold text-slate-500">
                        <User className="w-3.5 h-3.5 mr-1.5" /> {guide.author}
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" /> {guide.date} • <Clock className="w-3.5 h-3.5 ml-2 mr-1" /> {guide.time}
                      </div>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center animate-in fade-in duration-700 delay-1000">
            <button className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Load More Articles
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
