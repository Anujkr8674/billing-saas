"use client";

import { useState } from "react";
import {
  CheckCircle, ShieldCheck, Zap,
  FileText, FileSignature, ClipboardList, Truck, Package,
  ListChecks, Banknote, Receipt, Car, FileCheck, ArrowRight, Check, X, Mail, ImageIcon, Phone, MapPin, Target, Shield, Users
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import Typewriter from "@/components/Typewriter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { siteAssets } from "@/lib/site-assets";

export default function Home() {
  const [selectedDoc, setSelectedDoc] = useState<{ title: string, desc: string, detailed: string } | null>(null);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const DocumentCard = ({ title, desc, detailed, icon, color, onClick }: any) => {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 flex flex-col items-center text-center cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group"
      >
        <div className={`w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-${color}-500 mb-6 group-hover:scale-110 group-hover:bg-${color}-50 transition-all duration-300 relative`}>
          {icon}
          <div className="mt-4 flex justify-center absolute -bottom-4">
            <span className="pulsing-dot bg-primary"></span>
            <span className="pulsing-dot bg-primary"></span>
            <span className="pulsing-dot bg-primary"></span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-4 leading-relaxed">{desc}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative w-full min-h-screen flex flex-col pt-32 pb-20 overflow-hidden bg-white" id="home">
        {/* Background shape removed as requested */}

        <div className="floating-dots-container absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="floating-dot bg-[#00ffcc] w-4 h-4 rounded-full absolute" style={{ left: '60%', top: '30%', animationDuration: '6s' }}></div>
          <div className="floating-dot bg-[#ff9900] w-6 h-6 rounded-full absolute" style={{ left: '75%', top: '60%', animationDuration: '8s' }}></div>
          <div className="floating-dot bg-[#6142e5] w-8 h-8 rounded-full absolute" style={{ left: '50%', top: '80%', animationDuration: '10s' }}></div>
          <div className="floating-dot bg-[#ff3399] w-5 h-5 rounded-full absolute" style={{ left: '85%', top: '20%', animationDuration: '7s' }}></div>
          <div className="floating-dot bg-[#00ffcc] w-4 h-4 rounded-full absolute" style={{ left: '90%', top: '70%', animationDuration: '9s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal direction="up">
              <div className="flex flex-col items-start text-left">
                <div className="inline-flex items-center gap-2 text-slate-800 font-bold mb-4 text-lg">
                  🚀 Fast, Secure & Professional
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.2] mb-4 uppercase h-[60px] lg:h-[80px] flex items-center">
                  <Typewriter />
                </h1>
                <h2 className="text-2xl lg:text-4xl font-bold text-[#1f2937] mb-6">
                  India #1 Bilty & Quotation App
                </h2>

                <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                  Generate Bilty, LR, and Quotations in seconds! The simplest billing platform tailored for Relocation Experts and Packers & Movers.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link href="/signup" className="px-8 py-4 bg-white border-2 border-[#6142e5] text-[#6142e5] font-bold rounded-full hover:bg-slate-50 transition-all shadow-md flex items-center justify-center gap-2">
                    Free Registration <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a href="https://wa.me/8674823125" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#25D366]/90 transition-all shadow-md flex items-center justify-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    WhatsApp Us
                  </a>
                </div>

                <div className="flex items-center gap-6 mt-8">
                  <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />Now  Avilable Free
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> No credit card require
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="left" delay={0.2}>
              <div className="relative mt-12 lg:mt-0 animate-float-slow">
                <img src="https://packersbilling.in/images/hero_image2.webp" alt="Dashboard Preview" className="w-full h-auto relative z-10 scale-110 origin-right drop-shadow-2xl" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- PRIMARY FEATURES (UNIQUE FEATURES) --- */}
      <section className="py-24 px-6 bg-slate-50 relative z-10 -mt-10" id="features">
        <div className="max-w-7xl mx-auto">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-[#5b21b6] mb-6">Everything You Need to Bill</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Packers Billing software helps you quickly create invoices, quotes, and receipts. It makes billing incredibly easy.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* --- INITIAL 4 CARDS --- */}
              <DocumentCard onClick={() => setSelectedDoc({ title: "Invoices", desc: "Professional tax invoices with GST/VAT calculations.", detailed: "Create completely legally compliant tax invoices, automatically calculating GST/VAT based on individual line items." })} icon={<FileText size={40} className="text-blue-500" />} title="Invoices" desc="Make professional bills easily. It's simple and hassle-free!" color="blue" />
              <DocumentCard onClick={() => setSelectedDoc({ title: "Quotations", desc: "Win more business with stunning quotes.", detailed: "Send highly detailed, visually impressive cost estimates to potential clients. Add terms & conditions, validity periods, and custom branding." })} icon={<FileSignature size={40} className="text-emerald-500" />} title="Quotations" desc="Quickly create Quotations. It's straightforward and user-friendly!" color="emerald" />
              <DocumentCard onClick={() => setSelectedDoc({ title: "Lorry Receipts", desc: "Standardized transport receipts for cargo.", detailed: "The primary legal contract between a shipper and a carrier. Generate standard format Lorry Receipts (LR/Bilty) proving that goods have been received." })} icon={<Truck size={40} className="text-purple-500" />} title="Lorry Receipts" desc="Generate and share professional Lorry Receipts instantly." color="purple" />
              <DocumentCard onClick={() => setSelectedDoc({ title: "Loading Slips", desc: "Track items during the loading process.", detailed: "Generate loading slips for workers to ensure all inventory is properly loaded into the vehicle without errors." })} icon={<ListChecks size={40} className="text-orange-500" />} title="Loading Slips" desc="Keep track of every item loaded into your transport vehicles." color="orange" />

              {/* --- EXPANDED CARDS (6 MORE) --- */}
              {showAllDocs && (
                <>
                  <DocumentCard onClick={() => setSelectedDoc({ title: "Surveys", desc: "Pre-move inventory and site surveys.", detailed: "Conduct detailed surveys of the client's premises, logging the volume and nature of goods to be moved before providing a quote." })} icon={<ClipboardList size={40} className="text-cyan-500" />} title="Surveys" desc="Log accurate pre-move inventory and property surveys." color="cyan" />
                  <DocumentCard onClick={() => setSelectedDoc({ title: "Packing Lists", desc: "Detailed lists of all packed boxes.", detailed: "Create comprehensive packing lists identifying the contents of each carton to ensure nothing is lost during transit." })} icon={<Package size={40} className="text-rose-500" />} title="Packing Lists" desc="Detailed, box-by-box inventory for safe relocation." color="rose" />
                  <DocumentCard onClick={() => setSelectedDoc({ title: "Payment Vouchers", desc: "Internal accounting proof of cash payouts.", detailed: "Keep your internal accounts clean by generating instant payment vouchers for driver payouts, toll fees, and labor charges." })} icon={<Banknote size={40} className="text-teal-500" />} title="Payment Vouchers" desc="Track your daily expenses and labor payouts effortlessly." color="teal" />
                  <DocumentCard onClick={() => setSelectedDoc({ title: "Money Receipts", desc: "Acknowledge payments received from clients.", detailed: "Provide immediate, professional proof of payment to your clients. Works as an official acknowledgment that cash, cheque, or electronic transfer has been received." })} icon={<Receipt size={40} className="text-amber-500" />} title="Money Receipts" desc="Easily generate money receipts for received payments." color="amber" />
                  <DocumentCard onClick={() => setSelectedDoc({ title: "Vehicle Conditions", desc: "Log vehicle condition before transit.", detailed: "Document the state of the transport vehicle or the client's vehicle (if transporting cars) before the move begins to avoid liability claims." })} icon={<Car size={40} className="text-red-500" />} title="Vehicle Conditions" desc="Document vehicle conditions to prevent damage claims." color="red" />
                  <DocumentCard onClick={() => setSelectedDoc({ title: "NOC Forms", desc: "No Objection Certificates for compliance.", detailed: "Easily generate standardized NOC forms required for specific types of goods or state borders during relocation." })} icon={<FileCheck size={40} className="text-indigo-500" />} title="NOC Forms" desc="Generate No Objection Certificates for smooth transit." color="indigo" />
                  <div className="bg-slate-50/50 rounded-xl shadow-sm border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-3 opacity-50">✨</div>
                    <h3 className="text-xl font-bold text-slate-400 mb-2">Many More Bills</h3>
                    <p className="text-sm text-slate-400">Coming Soon</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setShowAllDocs(!showAllDocs)}
                className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-full hover:border-[#6142e5] hover:text-[#6142e5] transition-all shadow-sm flex items-center gap-2 group"
              >
                {showAllDocs ? "View Less" : "View More Documents"}
                <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${showAllDocs ? "-rotate-90" : "rotate-90 group-hover:translate-y-1"}`} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- STATS SECTION (COUNTERS) --- */}
      <section className="py-20 px-6 bg-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Fastest Growing <span className="text-primary">Business Network</span></h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">India's most trusted billing platform for Packers & Movers</p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-center">
              <div className="bg-white/5 p-6 md:p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:-translate-y-2 transition-transform duration-300">
                <div className="text-5xl mb-4">👨‍💼</div>
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  <AnimatedCounter end={10000} suffix="+" />
                </div>
                <div className="w-12 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
                <div className="text-slate-300 font-medium">Happy Businesses</div>
              </div>
              <div className="bg-white/5 p-6 md:p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:-translate-y-2 transition-transform duration-300">
                <div className="text-5xl mb-4">🚛</div>
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  <AnimatedCounter end={500} suffix=" Cr+" prefix="₹" />
                </div>
                <div className="w-12 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
                <div className="text-slate-300 font-medium">Invoices Processed</div>
              </div>
              <div className="bg-white/5 p-6 md:p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:-translate-y-2 transition-transform duration-300">
                <div className="text-5xl mb-4">🏙️</div>
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  <AnimatedCounter end={100} suffix="+" />
                </div>
                <div className="w-12 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
                <div className="text-slate-300 font-medium">Cities Active</div>
              </div>
              <div className="bg-white/5 p-6 md:p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:-translate-y-2 transition-transform duration-300">
                <div className="text-5xl mb-4">⭐</div>
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  <AnimatedCounter end={4.9} decimals={1} />
                </div>
                <div className="w-12 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
                <div className="text-slate-300 font-medium">Star Rating</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- WHY CHOOSE US / MISSION SECTION --- */}
      <section id="about" className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <Reveal direction="right">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#5b21b6] mb-4">Why Choose Packers Billing?</h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Logistics is the backbone of the economy, yet the software powering it is often stuck in the past. Creating quotes on paper or depending on computer templates is difficult. Packers Billing is the definitive solution to these problems.
                  </p>

                  <div className="space-y-3">
                    {[
                      {
                        id: 0,
                        title: "Bilty & Quotation On-the-Go",
                        desc: "No need to sit in the office! Generate professional Bilty (LR), Bills, and Receipts directly from your mobile, anywhere, anytime.",
                        icon: <Zap className={`w-6 h-6 ${activeFeature === 0 ? 'text-white' : 'text-primary'}`} />,
                        iconBg: activeFeature === 0 ? 'bg-primary' : 'bg-primary/10',
                        image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop"
                      },
                      {
                        id: 1,
                        title: "100% Easy to Use",
                        desc: "It is so easy to use that even your helper can learn it in 2 minutes. No technical knowledge required!",
                        icon: <ShieldCheck className={`w-6 h-6 ${activeFeature === 1 ? 'text-white' : 'text-emerald-500'}`} />,
                        iconBg: activeFeature === 1 ? 'bg-emerald-500' : 'bg-emerald-500/10',
                        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
                      },
                      {
                        id: 2,
                        title: "Professional Identity",
                        desc: "When you send a digital, clean bill and quotation to the customer, their trust in your business increases instantly.",
                        icon: <FileCheck className={`w-6 h-6 ${activeFeature === 2 ? 'text-white' : 'text-amber-500'}`} />,
                        iconBg: activeFeature === 2 ? 'bg-amber-500' : 'bg-amber-500/10',
                        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
                      }
                    ].map((feature) => (
                      <div
                        key={feature.id}
                        onClick={() => setActiveFeature(feature.id)}
                        className={`flex gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${activeFeature === feature.id ? 'border-primary shadow-md bg-primary/5' : 'border-transparent hover:bg-slate-50'}`}
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${feature.iconBg}`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{feature.title}</h3>
                          <p className="text-slate-600 text-sm md:text-base leading-relaxed">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal direction="left" delay={0.2}>
                <div className="relative h-[350px] md:h-[450px] lg:h-[500px] w-full">
                  {[
                    "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
                  ].map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Feature Preview"
                      className={`absolute inset-0 w-full h-full object-cover rounded-3xl shadow-xl transition-opacity duration-500 ease-in-out ${activeFeature === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    />
                  ))}
                  <div className="absolute -inset-4 border-2 border-primary/20 rounded-[2.5rem] -z-10 hidden md:block"></div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* --- ADVANCED FEATURES SECTION --- */}
      <section className="py-24 px-6 bg-[#6142e5] relative overflow-hidden rounded-t-[3rem] md:rounded-t-[4rem] mt-12 shadow-2xl w-full">
        <div className="floating-dots-container absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="floating-dot bg-[#00ffcc] w-3 h-3 rounded-full absolute" style={{ left: '10%', top: '20%', animationDuration: '7s' }}></div>
          <div className="floating-dot bg-[#ff3399] w-4 h-4 rounded-full absolute" style={{ left: '85%', top: '15%', animationDuration: '9s' }}></div>
          <div className="floating-dot bg-[#ff9900] w-2 h-2 rounded-full absolute" style={{ left: '70%', top: '60%', animationDuration: '6s' }}></div>
          <div className="floating-dot bg-[#00ffcc] w-5 h-5 rounded-full absolute" style={{ left: '25%', top: '80%', animationDuration: '10s' }}></div>
          <div className="floating-dot bg-[#ff3399] w-3 h-3 rounded-full absolute" style={{ left: '90%', top: '75%', animationDuration: '8s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Powerful Business Features</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Make your Packers and Movers business digital. Our advanced features make your billing and Bilty management incredibly easy and fast.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex gap-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                  <Target className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Mobile & Desktop Access</h3>
                  <p className="text-slate-600">Run the software on both mobile and desktop. Manage your business from anywhere, be it office or loading site.</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex gap-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                  <Shield className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Cloud Data Storage</h3>
                  <p className="text-slate-600">All your data is 100% safe on our cloud server. Even if you lose your phone, your records are always secure.</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex gap-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="w-20 h-20 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-purple-100 transition-all">
                  <FileCheck className="w-10 h-10 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Professional GST Invoicing</h3>
                  <p className="text-slate-600">Creating GST bills for Packers business is now super easy. Create professional invoices and increase your trust.</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex gap-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="w-20 h-20 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-100 transition-all">
                  <Banknote className="w-10 h-10 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Automatic Tax Calculation</h3>
                  <p className="text-slate-600">Leave the tension of manual calculation. Just enter the amount and the software will calculate GST automatically.</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex gap-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="w-20 h-20 bg-rose-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-rose-100 transition-all">
                  <Mail className="w-10 h-10 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">One-Click PDF Share</h3>
                  <p className="text-slate-600">Download your Bilty, Bill, and Quotation as PDFs and instantly share them with your customers on WhatsApp.</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 flex gap-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="w-20 h-20 bg-cyan-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-cyan-100 transition-all">
                  <ListChecks className="w-10 h-10 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Easy Management Dashboard</h3>
                  <p className="text-slate-600">Manage everything from Bilty to receipt in one place. User-friendly design that anyone can use easily.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <FAQ />

      {/* --- TESTIMONIALS SECTION --- */}
      <Testimonials />

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-24 px-6 bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <Reveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#5b21b6] mb-6">Get in Touch</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Have questions about our software or need a custom integration? Our team is here to help you out.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-slate-50 rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-[#3b219e] to-[#251070] p-12 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-8">Contact Information</h3>
                  <p className="text-indigo-100 mb-12 text-lg">Fill out the form and our team will get back to you within 24 hours.</p>

                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-indigo-200 mb-1">Call Us (24/7 Support)</p>
                        <p className="font-semibold text-lg text-white">+91 0000000000</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-indigo-200 mb-1">Email Support</p>
                        <p className="font-semibold text-lg text-white">nextgensaasbilling@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-indigo-200 mb-1">Headquarters</p>
                        <p className="font-semibold text-lg text-white">5th floor R.R Tower<br />Near Mall Of Ranchi, Ratu road</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Send us a Message</h3>
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6 bg-slate-50">
        <Reveal direction="up">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary via-[#4f46e5] to-accent rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to upgrade your billing?</h2>
              <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of businesses streamlining their operations today.
              </p>
              <Link href="/signup" className="inline-flex px-10 py-5 bg-white text-primary text-xl font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl">
                Create Your Free Account
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />

      {/* --- MODAL FOR DOCUMENT DETAILS --- */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedDoc(null)}>
          <div
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{selectedDoc.title}</h3>
            <div className="w-12 h-1 bg-primary rounded-full mb-6"></div>
            <p className="text-lg font-medium text-slate-700 mb-4">{selectedDoc.desc}</p>
            <p className="text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {selectedDoc.detailed}
            </p>
            <div className="mt-8 flex justify-end">
              <Link href="/signup" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Try it now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
