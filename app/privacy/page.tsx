import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 py-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-slate-600 font-medium">Last updated: June 2026</p>
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-200 text-slate-600 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold">
              <p className="text-lg leading-relaxed mb-8">
                At NextGen Billing, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our logistics billing software.
              </p>

              <h2 className="text-2xl mt-12 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-500">1</span>
                Information We Collect
              </h2>
              <p className="leading-relaxed">
                We collect information that you provide directly to us when you register for an account, update your profile, use our interactive features, or contact us for support. The types of personal information we may collect include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
                <li>Contact information (such as name, email address, phone number)</li>
                <li>Business details (such as company name, GSTIN, operational addresses)</li>
                <li>Driver and fleet details added into the system</li>
                <li>Log data and device information automatically collected by our servers</li>
              </ul>

              <h2 className="text-2xl mt-12 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-500">2</span>
                How We Use Your Information
              </h2>
              <p className="leading-relaxed mb-4">
                We use the information we collect to provide, maintain, and improve our services. Specifically, we may use the information to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Facilitate account creation and authentication</li>
                <li>Generate accurate Lorry Receipts and invoices based on your inputs</li>
                <li>Send administrative information, security alerts, and technical notices</li>
                <li>Respond to customer service requests and provide support</li>
                <li>Monitor and analyze usage trends to improve the user experience</li>
              </ul>

              <h2 className="text-2xl mt-12 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-500">3</span>
                Data Security & Retention
              </h2>
              <p className="leading-relaxed">
                We implement a variety of security measures to maintain the safety of your personal information. All sensitive data is transmitted via Secure Socket Layer (SSL) technology and encrypted in our databases. We retain your personal data only for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>

              <h2 className="text-2xl mt-12 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-500">4</span>
                Third-Party Sharing
              </h2>
              <p className="leading-relaxed">
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential and comply with strict data protection standards.
              </p>

              <h2 className="text-2xl mt-12 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm text-slate-500">5</span>
                Your Rights
              </h2>
              <p className="leading-relaxed">
                Depending on your location, you may have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances. To request to review, update, or delete your personal information, please contact our support team.
              </p>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-100">
              <p className="text-sm text-slate-400">
                If you have questions or comments about this Privacy Policy, please contact us at: privacy@nextgenbilling.com
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
