const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'components', 'providers', 'ThemeProvider.tsx');
let content = fs.readFileSync(file, 'utf8');

content = `"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { getUserProfile } from "@/app/actions/user";
import { usePathname } from "next/navigation";

export type PageTheme = "light" | "dark" | "system" | string;
export type SidebarTheme = "default" | "purple" | "green" | "dark" | "blue" | string;

interface ThemeContextType {
  adminPageTheme: PageTheme;
  setAdminPageTheme: (theme: PageTheme) => void;
  userPageTheme: PageTheme;
  setUserPageTheme: (theme: PageTheme) => void;
  adminSidebarTheme: SidebarTheme;
  setAdminSidebarTheme: (theme: SidebarTheme) => void;
  userSidebarTheme: SidebarTheme;
  setUserSidebarTheme: (theme: SidebarTheme) => void;
  broadcastThemeUpdate: (type: 'adminPage' | 'userPage' | 'admin' | 'user', theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children,
  initialAdminPageTheme = "system",
  initialUserPageTheme = "system",
  initialAdminTheme = "purple",
  initialUserTheme = "green"
}: { 
  children: React.ReactNode,
  initialAdminPageTheme?: PageTheme,
  initialUserPageTheme?: PageTheme,
  initialAdminTheme?: SidebarTheme,
  initialUserTheme?: SidebarTheme
}) {
  const [adminPageTheme, setAdminPageTheme] = useState<PageTheme>(initialAdminPageTheme);
  const [userPageTheme, setUserPageTheme] = useState<PageTheme>(initialUserPageTheme);
  const [adminSidebarTheme, setAdminSidebarTheme] = useState<SidebarTheme>(initialAdminTheme);
  const [userSidebarTheme, setUserSidebarTheme] = useState<SidebarTheme>(initialUserTheme);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const storedAdminPageTheme = localStorage.getItem("adminPageTheme") as PageTheme;
    const storedUserPageTheme = localStorage.getItem("userPageTheme") as PageTheme;
    const storedAdminSidebarTheme = localStorage.getItem("adminSidebarTheme") as SidebarTheme;
    const storedUserSidebarTheme = localStorage.getItem("userSidebarTheme") as SidebarTheme;

    if (storedAdminPageTheme) setAdminPageTheme(storedAdminPageTheme);
    if (storedUserPageTheme) setUserPageTheme(storedUserPageTheme);
    if (storedAdminSidebarTheme) setAdminSidebarTheme(storedAdminSidebarTheme);
    if (storedUserSidebarTheme) setUserSidebarTheme(storedUserSidebarTheme);
    
    setMounted(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "adminPageTheme" && e.newValue) setAdminPageTheme(e.newValue);
      if (e.key === "userPageTheme" && e.newValue) setUserPageTheme(e.newValue);
      if (e.key === "adminSidebarTheme" && e.newValue) setAdminSidebarTheme(e.newValue);
      if (e.key === "userSidebarTheme" && e.newValue) setUserSidebarTheme(e.newValue);
    };

    window.addEventListener("storage", handleStorageChange);

    const setupRealtime = async () => {
      try {
        const user = await getUserProfile();
        if (user?.id) {
          setUserId(user.id);
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const channel = supabase.channel(\`theme-sync-\${user.id}\`);
            
            channel.on('broadcast', { event: 'theme_update' }, (payload) => {
              if (payload.payload.type === 'adminPage') setAdminPageTheme(payload.payload.theme);
              if (payload.payload.type === 'userPage') setUserPageTheme(payload.payload.theme);
              if (payload.payload.type === 'admin') setAdminSidebarTheme(payload.payload.theme);
              if (payload.payload.type === 'user') setUserSidebarTheme(payload.payload.theme);
            }).subscribe();
            
            channelRef.current = channel;
          }
        }
      } catch (error) {
        console.error("Failed to setup realtime theme sync", error);
      }
    };
    
    setupRealtime();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (channelRef.current) channelRef.current.unsubscribe();
    };
  }, []);

  const broadcastThemeUpdate = (type: 'adminPage' | 'userPage' | 'admin' | 'user', theme: string) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'theme_update',
        payload: { type, theme }
      });
    }
  };

  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem("adminPageTheme", adminPageTheme);
    localStorage.setItem("userPageTheme", userPageTheme);
    localStorage.setItem("adminSidebarTheme", adminSidebarTheme);
    localStorage.setItem("userSidebarTheme", userSidebarTheme);
    
    document.cookie = \`adminPageTheme=\${adminPageTheme}; path=/; max-age=31536000\`;
    document.cookie = \`userPageTheme=\${userPageTheme}; path=/; max-age=31536000\`;
    document.cookie = \`adminSidebarTheme=\${encodeURIComponent(adminSidebarTheme)}; path=/; max-age=31536000\`;
    document.cookie = \`userSidebarTheme=\${encodeURIComponent(userSidebarTheme)}; path=/; max-age=31536000\`;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    document.body.style.backgroundColor = '';

    const isAdmin = pathname?.startsWith("/admin");
    const activePageTheme = isAdmin ? adminPageTheme : userPageTheme;

    if (activePageTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else if (activePageTheme?.startsWith("#")) {
      document.body.style.backgroundColor = activePageTheme;
      root.classList.add("light"); // Default text colors to light mode when custom background is used
    } else {
      root.classList.add(activePageTheme);
    }
  }, [adminPageTheme, userPageTheme, adminSidebarTheme, userSidebarTheme, mounted, pathname]);

  return (
    <ThemeContext.Provider value={{
      adminPageTheme, setAdminPageTheme,
      userPageTheme, setUserPageTheme,
      adminSidebarTheme, setAdminSidebarTheme,
      userSidebarTheme, setUserSidebarTheme,
      broadcastThemeUpdate,
    }}>
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log('ThemeProvider written');
