"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, CreditCard, LayoutDashboard, Settings, Activity, Menu, X,
  LogOut, ChevronDown, MessageSquare
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useTheme } from "@/components/providers/ThemeProvider";
import { siteAssets } from "@/lib/site-assets";

export default function ClientLayout({
  children,
  userProfile
}: {
  children: React.ReactNode;
  userProfile: any;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { adminSidebarTheme, setAdminSidebarTheme, adminPageTheme, setAdminPageTheme } = useTheme();

  useEffect(() => {
    const dbTheme = userProfile?.sidebarTheme;
    if (dbTheme && dbTheme !== adminSidebarTheme) {
      setAdminSidebarTheme(dbTheme);
      document.cookie = `adminSidebarTheme=${encodeURIComponent(dbTheme)}; path=/; max-age=31536000`;
    }
    
    const dbPageTheme = userProfile?.adminPageTheme;
    if (dbPageTheme && dbPageTheme !== adminPageTheme) {
      setAdminPageTheme(dbPageTheme);
      document.cookie = `adminPageTheme=${encodeURIComponent(dbPageTheme)}; path=/; max-age=31536000`;
    }
  }, [userProfile?.sidebarTheme, userProfile?.adminPageTheme]);


  const links = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Users", href: "/admin/dashboard/users", icon: Users },
    { name: "Payments", href: "/admin/dashboard/payments", icon: CreditCard },
    { name: "Subscriptions", href: "/admin/dashboard/subscriptions", icon: Activity },
    { name: "Contacts", href: "/admin/dashboard/contacts", icon: MessageSquare },
    { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
  ];

  let sidebarClass = "bg-card border-border text-foreground";
  let activeLinkClass = "bg-danger/10 text-danger";
  let hoverLinkClass = "text-foreground hover:bg-danger/10 hover:text-danger";
  let titleClass = "text-danger";
  let borderClass = "border-border";

  let scrollbarClass = "scrollbar-transparent";
  if (adminSidebarTheme === "purple") {
    sidebarClass = "bg-[#5B21B6] text-white";
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-white/80 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  } else if (adminSidebarTheme === "green") {
    sidebarClass = "bg-[#16A34A] text-white";
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-white/80 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  } else if (adminSidebarTheme === "blue") {
    sidebarClass = "bg-blue-600 text-white";
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-white/80 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  } else if (adminSidebarTheme === "dark") {
    sidebarClass = "bg-gray-900 text-white";
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-gray-400 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  } else if (adminSidebarTheme.startsWith("#")) {
    sidebarClass = "text-white"; // default text color for custom hex
    activeLinkClass = "bg-white/20 text-white font-bold";
    hoverLinkClass = "text-white/80 hover:bg-white/10 hover:text-white";
    titleClass = "text-white";
    borderClass = "border-white/10";
    scrollbarClass = "scrollbar-white";
  }

  const userName = userProfile?.name || "Admin User";
  const initial = userName.charAt(0).toUpperCase();

  // Admin always uses the Nextgen logo
  const logoSrc = siteAssets.logo;

  return (
    <div className={`flex h-screen overflow-hidden ${adminPageTheme?.startsWith("#") ? "bg-transparent" : "bg-background"}`}>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex border-r ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${sidebarClass} ${borderClass}`}
        style={adminSidebarTheme.startsWith("#") ? { backgroundColor: adminSidebarTheme } : {}}
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
              const isActive = pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
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
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header 
          className={`h-16 border-b flex items-center px-4 md:px-6 justify-between ${sidebarClass} ${borderClass}`}
          style={adminSidebarTheme.startsWith("#") ? { backgroundColor: adminSidebarTheme } : {}}
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
             <ThemeSwitcher panelType="admin" />
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
                        <p className="text-xs text-muted-foreground">Admin</p>
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-transparent">
          {children}
        </div>
      </main>
    </div>
  );
}
