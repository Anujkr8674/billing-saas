"use client";

import { Star } from "lucide-react";
import Reveal from "./Reveal";

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "Ramesh Kumar",
      avatar: "R",
      color: "bg-blue-500",
      date: "3 days ago",
      text: "Packers Billing has completely changed how we handle our logistics operations. Generating Lorry Receipts and Quotations takes just seconds now. Highly recommended for any transport business!",
      rating: 5,
    },
    {
      id: 2,
      name: "Sharma Relocations",
      avatar: "S",
      color: "bg-emerald-500",
      date: "1 week ago",
      text: "The best bilty software in India. Very easy to use, even for our drivers. The support team is also very responsive and helpful. Worth every penny.",
      rating: 5,
    },
    {
      id: 3,
      name: "Agarwal Movers",
      avatar: "A",
      color: "bg-orange-500",
      date: "2 weeks ago",
      text: "I love the fact that we can generate beautiful, professional quotes directly from our phones while at the client's location. It has increased our closing rate significantly.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 px-6 bg-slate-50 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <Reveal direction="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1f2937]">What Our <span className="text-[#5b21b6]">Clients Say</span></h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Don't just take our word for it. Here's what logistics experts across India think about Packers Billing.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review, index) => (
            <Reveal key={review.id} direction="up" delay={index * 0.1}>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                      {review.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">{review.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{review.date}</p>
                    </div>
                  </div>
                  {/* Google Icon */}
                  <div className="w-6 h-6 flex-shrink-0">
                    <svg viewBox="0 0 48 48" width="100%" height="100%">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#fbbc04] text-[#fbbc04]" />
                  ))}
                </div>
                <p className="text-slate-600 text-[15px] leading-relaxed flex-grow">
                  "{review.text}"
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
