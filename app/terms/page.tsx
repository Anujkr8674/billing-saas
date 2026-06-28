import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 py-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 tracking-tight">Terms of Service</h1>
            <p className="text-lg text-slate-600 font-medium">Effective Date: June 2026</p>
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-200 text-slate-600 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            
            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold">
              <p className="text-lg leading-relaxed mb-8 font-medium text-slate-700">
                Please read these terms carefully. By accessing or using the NextGen Billing platform, you agree to be bound by these Terms of Service and all terms incorporated by reference.
              </p>

              <h2 className="text-2xl mt-12 mb-6">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By registering for an account and using the NextGen Billing service (the "Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service.
              </p>

              <h2 className="text-2xl mt-12 mb-6">2. Provision of Services</h2>
              <p className="leading-relaxed mb-4">
                NextGen Billing provides logistics billing, invoicing, LR generation, and fleet management software as a SaaS product. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Modify, suspend, or discontinue the Service with notice.</li>
                <li>Update our platform with new features or remove deprecated ones.</li>
                <li>Limit access to certain features based on your organizational role.</li>
              </ul>

              <h2 className="text-2xl mt-12 mb-6">3. User Obligations and Conduct</h2>
              <p className="leading-relaxed mb-4">
                As a user of the Service, you are solely responsible for all data, information, and other content that you upload, post, or otherwise provide. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Use the Service for any illegal or unauthorized purpose.</li>
                <li>Submit false or misleading fleet, driver, or taxation data.</li>
                <li>Attempt to reverse engineer, decompile, or hack the Service.</li>
                <li>Share your administrative login credentials with unauthorized users.</li>
              </ul>

              <h2 className="text-2xl mt-12 mb-6">4. Data Accuracy and Compliance</h2>
              <p className="leading-relaxed">
                You are responsible for ensuring that the data entered into NextGen Billing (including GSTINs, tax rates, and vehicle details) is accurate and complies with local and national regulations. NextGen Billing is not liable for any penalties or legal issues arising from incorrect data entry or misuse of the generated documents (e.g., invalid e-Way Bills or Lorry Receipts).
              </p>

              <h2 className="text-2xl mt-12 mb-6">5. Intellectual Property</h2>
              <p className="leading-relaxed">
                The Service and its original content, features, and functionality are and will remain the exclusive property of NextGen Billing and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks may not be used in connection with any product or service without the prior written consent of NextGen Billing.
              </p>

              <h2 className="text-2xl mt-12 mb-6">6. Limitation of Liability</h2>
              <p className="leading-relaxed">
                In no event shall NextGen Billing, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>

              <h2 className="text-2xl mt-12 mb-6">7. Termination</h2>
              <p className="leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
