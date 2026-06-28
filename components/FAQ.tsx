"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";

const faqs = [
  {
    question: "Can I create Bilty (LR) and Quotations with this software?",
    answer: "Yes! NextGen Billing software is specifically designed for creating Professional Lorry Receipts (LR), Quotations, and Money Receipts. You can generate them in 1 minute and share directly via WhatsApp or Email.",
  },
  {
    question: "Do I need a computer to use this software?",
    answer: "No, you can use it on any Android Mobile, Tablet, or Laptop. It's a 100% cloud-based platform, which means you can manage your billing from anywhere, at any time.",
  },
  {
    question: "Is my business data safe and secure?",
    answer: "Absolutely! Your data is stored on encrypted and highly secure cloud servers. Only you and your authorized staff have access to your business records.",
  },
  {
    question: "Does this software calculate GST automatically?",
    answer: "Yes, it features an automated GST calculation system. Once you enter the base amount and select the tax slab, the system automatically calculates the CGST and SGST/IGST for you.",
  },
  {
    question: "How do I get help if I'm stuck?",
    answer: "Our support team is available 24/7 to assist you. You can contact us directly via Phone or Email, and we'll help you with setup, training, and troubleshooting.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <Reveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#5b21b6] mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Got questions? We've got answers. If you have some other questions, feel free to contact us.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="text-lg font-bold text-slate-800">{faq.question}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${openIndex === index ? "bg-primary text-white rotate-180" : "bg-slate-100 text-slate-500"}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div 
                  className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <p className="text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
