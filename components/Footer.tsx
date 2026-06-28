import Link from "next/link";
import { siteAssets } from "@/lib/site-assets";
import { Globe, MessageCircle, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#6142e5] via-[#4b32b8] to-[#291770] text-indigo-100 py-16 border-t-4 border-[#00ffcc] mt-auto relative overflow-hidden shadow-[0_-10px_40px_rgba(97,66,229,0.2)]">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ffcc]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div>
            <Link href="/" className="inline-block mb-6 bg-white p-2 rounded-xl">
              <img src={siteAssets.logo} alt="NextGen Billing Logo" className="h-10" />
            </Link>
            <p className="text-indigo-200 leading-relaxed mb-6">
              The ultimate SaaS billing engine for logistics, packers & movers, and transport fleets. Generate documents with zero hassle.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#00ffcc] hover:text-[#291770] hover:border-[#00ffcc] transition-all">
                <Globe className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#00ffcc] hover:text-[#291770] hover:border-[#00ffcc] transition-all">
                <MessageCircle className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#00ffcc] hover:text-[#291770] hover:border-[#00ffcc] transition-all">
                <Mail className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-indigo-200 hover:text-[#00ffcc] transition-colors">Home</Link></li>
              <li><Link href="/#about" className="text-indigo-200 hover:text-[#00ffcc] transition-colors">About Us</Link></li>
              <li><Link href="/#contact" className="text-indigo-200 hover:text-[#00ffcc] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/#features" className="text-indigo-200 hover:text-[#00ffcc] transition-colors">Features</Link></li>
              <li><Link href="/changelog" className="text-indigo-200 hover:text-[#00ffcc] transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Legal & Support Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Legal & Support</h4>
            <ul className="space-y-4">
              <li><Link href="/help" className="text-indigo-200 hover:text-[#00ffcc] transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="text-indigo-200 hover:text-[#00ffcc] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-indigo-200 hover:text-[#00ffcc] transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="text-indigo-200 hover:text-[#00ffcc] transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-indigo-300 text-sm">
            &copy; {new Date().getFullYear()} NextGen Billing. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-indigo-300">
            <span>Made with</span>
            <span className="text-[#00ffcc] animate-pulse">❤</span>
            <span>for the Logistics Industry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
