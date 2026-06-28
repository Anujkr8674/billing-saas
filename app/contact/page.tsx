import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Get in Touch</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Have questions about our software, pricing, or need a custom integration? Our team is here to help you out.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

            {/* Contact Info (Left) */}
            <div className="bg-slate-950 p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
                <p className="text-slate-400 mb-12 text-lg">Fill out the form and our team will get back to you within 24 hours.</p>

                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Call Us (24/7 Support)</p>
                      <p className="font-semibold text-lg">+91 0000000000</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Email Support</p>
                      <p className="font-semibold text-lg">nextgensaasbilling@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Headquarters</p>
                      <p className="font-semibold text-lg">5th floor R.R Tower<br />Near Mall Of Ranchi, Ratu road</p>
                    </div>
                  </div>

                  {/* Google Maps Embed */}
                  <div className="mt-8 rounded-xl overflow-hidden border border-white/10">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14652.518884976451!2d85.30932595!3d23.3855523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f4e17cb95a31eb%3A0xfec677b1e4284ab9!2sR.R.%20Tower!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form (Right) */}
            <div className="p-12">
              <ContactForm />
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
