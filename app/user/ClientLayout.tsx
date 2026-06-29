"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileText, FileSpreadsheet, Receipt, Truck, 
  Package, CreditCard, Banknote, ShieldAlert, FileCheck, 
  BarChart, Wallet, User, Settings as SettingsIcon, Menu, X,
  LogOut, ChevronDown
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useTheme } from "@/components/providers/ThemeProvider";
import { siteAssets } from "@/lib/site-assets";
import Image from "next/image";

export default function ClientLayout({
  children,
  userProfile
}: {
  children: React.ReactNode;
  userProfile: any | null;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isModalDismissed, setIsModalDismissed] = useState(false);
  const pathname = usePathname();
  const { userSidebarTheme, setUserSidebarTheme, userPageTheme } = useTheme();

  useEffect(() => {
    // If the database has a different theme than what the local browser context has, sync it.
    // This happens if the user changed the theme on another device/browser.
    const dbTheme = userProfile?.profile?.sidebarTheme;
    if (dbTheme && dbTheme !== userSidebarTheme) {
      setUserSidebarTheme(dbTheme);
      document.cookie = `userSidebarTheme=${encodeURIComponent(dbTheme)}; path=/; max-age=31536000`;
    }
  }, [userProfile?.profile?.sidebarTheme]);

  // Check if profile is complete
  const p = userProfile?.profile;
  const isProfileComplete = !!(p?.companyName && p?.addressLine1 && p?.city && p?.state && p?.pincode);
  
  const isCreationRoute = pathname.endsWith('/new');
  // Show modal if profile incomplete AND they are not on profile page.
  // If it's a creation route, force show it (ignore dismissal).
  const showProfileModal = !isProfileComplete && pathname !== "/user/profile" && (!isModalDismissed || isCreationRoute);

  const links = [
    { name: "Dashboard", href: "/user", icon: LayoutDashboard },
    { name: "Surveys", href: "/user/surveys", icon: FileText },
    { name: "Quotations", href: "/user/quotations", icon: FileSpreadsheet },
    { name: "Invoices", href: "/user/invoices", icon: Receipt },
    { name: "Loading Slips", href: "/user/loading-slips", icon: Truck },
    { name: "Lorry Receipts", href: "/user/lorry-receipts", icon: Receipt },
    { name: "Packing Lists", href: "/user/packing-lists", icon: Package },
    { name: "Payment Vouchers", href: "/user/payment-vouchers", icon: CreditCard },
    { name: "Money Receipts", href: "/user/money-receipts", icon: Banknote },
    { name: "Vehicle Conditions", href: "/user/vehicle-conditions", icon: ShieldAlert },
    { name: "NOC Forms", href: "/user/noc-forms", icon: FileCheck },
    { name: "Reports", href: "/user/reports", icon: BarChart },
    { name: "Profile", href: "/user/profile", icon: User },
    { name: "Settings", href: "/user/settings", icon: SettingsIcon },
  ];

  let sidebarClass = "bg-card border-border text-foreground";
  let activeLinkClass = "bg-primary/10 text-primary";
  let hoverLinkClass = "text-foreground hover:bg-muted hover:text-primary";
  let titleClass = "text-primary";
  let borderClass = "border-border";

  let scrollbarClass = "scrollbar-transparent";
  if (userSidebarTheme === "purple") {
    sidebarClass = "bg-[#5B21B6] text-white";
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-white/80 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  } else if (userSidebarTheme === "green") {
    sidebarClass = "bg-[#16A34A] text-white";
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-white/80 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  } else if (userSidebarTheme === "blue") {
    sidebarClass = "bg-blue-600 text-white";
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-white/80 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  } else if (userSidebarTheme === "dark") {
    sidebarClass = "bg-gray-900 text-white";
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-gray-400 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  } else if (userSidebarTheme.startsWith("#")) {
    sidebarClass = "text-white"; // default text color for custom hex
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-white/80 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  }

  const userName = userProfile?.name || "User";
  const initial = userName.charAt(0).toUpperCase();

  const logoSrc = userProfile?.companyLogo ? userProfile.companyLogo : siteAssets.logo;

  return (
    <div className={`flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white ${userPageTheme?.startsWith("#") ? "bg-transparent" : "bg-background"}`}>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden print:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex border-r ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${sidebarClass} ${borderClass} print:hidden`}
        style={userSidebarTheme.startsWith("#") ? { backgroundColor: userSidebarTheme } : {}}
      >
        <div className={`h-16 flex items-center justify-between px-6 border-b ${borderClass}`}>
          <div className="relative w-48 h-12 flex items-center">
            <img src={logoSrc} alt="Company Logo" className="max-h-full max-w-full object-contain" />
          </div>
          <button className="md:hidden opacity-80 hover:opacity-100" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className={`flex-1 overflow-y-auto py-4 ${scrollbarClass}`}>
          <ul className="space-y-1 px-3">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/user' && pathname.startsWith(link.href + '/'));
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? activeLinkClass : hoverLinkClass}`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={`p-4 border-t ${borderClass}`}>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 print:block print:overflow-visible print:h-auto print:bg-white">
        {/* Topbar */}
        <header 
          className={`h-16 border-b flex items-center px-4 md:px-6 justify-between ${sidebarClass} ${borderClass} print:hidden`}
          style={userSidebarTheme.startsWith("#") ? { backgroundColor: userSidebarTheme } : {}}
        >
          <div className="flex items-center gap-4">
            <button className="md:hidden opacity-80 hover:opacity-100" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className={`font-semibold hidden sm:block ${titleClass}`}>
              {userName}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeSwitcher panelType="user" />
            <div className={`flex items-center gap-2 border-l pl-4 relative ${borderClass}`}>
              <button 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-black/10 dark:bg-white/10 ${titleClass}`}>
                  {initial}
                </div>
                <ChevronDown className={`w-4 h-4 ${titleClass}`} />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 text-card-foreground">
                    <div className="p-4 border-b border-border">
                      <p className="font-semibold truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userProfile?.planName}</p>
                    </div>
                    <div className="p-2">
                      <LogoutButton />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:overflow-visible">
          {children}
        </div>
      </main>

      {/* Profile Completion Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-8 text-center relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                if (isCreationRoute) {
                  window.history.back();
                } else {
                  setIsModalDismissed(true);
                }
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Complete Your Profile</h2>
            <p className="text-muted-foreground mb-8">
              Welcome to NextGen Billing! To start creating invoices, quotations, and other documents, you must first set up your business profile with your company name and address.
            </p>
            <Link 
              href="/user/profile"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Complete Profile Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
