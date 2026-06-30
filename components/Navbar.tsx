"use client";

import Link from "next/link";
import { siteAssets } from "@/lib/site-assets";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      if (pathname !== "/") return;
      const sections = ["features", "about", "contact"];
      let current = "";
      
      if (window.scrollY < 100) {
        setActiveSection("");
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            current = section;
          }
        }
      }
      if (current !== "") {
         setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/", id: "" },
    { name: "Features", href: "/#features", id: "features" },
    { name: "About", href: "/#about", id: "about" },
    { name: "Contact", href: "/#contact", id: "contact" },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={`h-20 flex items-center justify-between px-8 fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled || pathname !== "/" ? "bg-white shadow-md" : "bg-transparent"
    }`}>
      <Link href="/" className="flex items-center">
        <img src={siteAssets.logo} alt="NextGen Billing Logo" className="h-10" />
      </Link>
      <nav className="hidden md:flex gap-2 font-medium">
        {navLinks.map((link) => {
          let isActive = false;
          
          if (pathname === "/") {
            isActive = activeSection === link.id;
          } else if (link.href === "/") {
            isActive = false; // Not home, so home shouldn't be active
          } else {
            // For other pages, we can just check if we are on that path (though these links are hashes now)
            isActive = pathname.includes(link.name.toLowerCase());
          }

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`px-4 py-2 rounded-lg transition-colors ${isActive
                  ? "bg-primary/10 text-primary font-bold shadow-sm"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-4">
        <Link href="/signup" className="hidden sm:flex px-6 py-2.5 bg-white text-[#6142e5] font-bold rounded-full hover:bg-slate-50 transition-all shadow-md items-center gap-2">
          Start Now <span className="rotate-45 text-lg leading-none">↑</span>
        </Link>
        <Link href="/login" className="px-6 py-2.5 bg-[#5b21b6] text-white font-bold rounded-full hover:bg-[#5b21b6]/90 transition-all shadow-md items-center gap-2 flex">
          Login <span className="rotate-45 text-lg leading-none">↑</span>
        </Link>
        <button 
          className="md:hidden p-2 text-slate-700 hover:text-primary transition-colors focus:outline-none z-[60]" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[55] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Navigation Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-[55] md:hidden transform transition-transform duration-300 ease-in-out flex flex-col pt-24 px-6 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-4 text-slate-700 font-medium hover:bg-primary/5 hover:text-primary rounded-lg transition-colors text-lg"
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-slate-100 my-4"></div>
          <Link 
            href="/signup" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="sm:hidden px-4 py-4 text-[#6142e5] font-bold hover:bg-primary/5 rounded-lg flex items-center justify-between transition-colors text-lg"
          >
            Start Now <span>↑</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
