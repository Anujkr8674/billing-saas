"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { getUserProfile } from "@/app/actions/user";

export type PageTheme = "light" | "dark" | "system" | string;
export type SidebarTheme = "default" | "purple" | "green" | "dark" | "blue" | string;

interface ThemeContextType {
  pageTheme: PageTheme;
  setPageTheme: (theme: PageTheme) => void;
  adminSidebarTheme: SidebarTheme;
  setAdminSidebarTheme: (theme: SidebarTheme) => void;
  userSidebarTheme: SidebarTheme;
  setUserSidebarTheme: (theme: SidebarTheme) => void;
  broadcastThemeUpdate: (type: 'page' | 'admin' | 'user', theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children,
  initialPageTheme = "system",
  initialAdminTheme = "purple",
  initialUserTheme = "green"
}: { 
  children: React.ReactNode,
  initialPageTheme?: PageTheme,
  initialAdminTheme?: SidebarTheme,
  initialUserTheme?: SidebarTheme
}) {
  const [pageTheme, setPageTheme] = useState<PageTheme>(initialPageTheme);
  const [adminSidebarTheme, setAdminSidebarTheme] = useState<SidebarTheme>(initialAdminTheme);
  const [userSidebarTheme, setUserSidebarTheme] = useState<SidebarTheme>(initialUserTheme);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const storedPageTheme = localStorage.getItem("pageTheme") as PageTheme;
    const storedAdminSidebarTheme = localStorage.getItem("adminSidebarTheme") as SidebarTheme;
    const storedUserSidebarTheme = localStorage.getItem("userSidebarTheme") as SidebarTheme;

    if (storedPageTheme) setPageTheme(storedPageTheme);
    if (storedAdminSidebarTheme) setAdminSidebarTheme(storedAdminSidebarTheme);
    if (storedUserSidebarTheme) setUserSidebarTheme(storedUserSidebarTheme);
    
    setMounted(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pageTheme" && e.newValue) setPageTheme(e.newValue);
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
            const channel = supabase.channel(`theme-sync-${user.id}`);
            
            channel.on('broadcast', { event: 'theme_update' }, (payload) => {
              if (payload.payload.type === 'page') setPageTheme(payload.payload.theme);
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

  const broadcastThemeUpdate = (type: 'page' | 'admin' | 'user', theme: string) => {
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
    
    localStorage.setItem("pageTheme", pageTheme);
    localStorage.setItem("adminSidebarTheme", adminSidebarTheme);
    localStorage.setItem("userSidebarTheme", userSidebarTheme);
    
    document.cookie = `pageTheme=${pageTheme}; path=/; max-age=31536000`;
    document.cookie = `adminSidebarTheme=${encodeURIComponent(adminSidebarTheme)}; path=/; max-age=31536000`;
    document.cookie = `userSidebarTheme=${encodeURIComponent(userSidebarTheme)}; path=/; max-age=31536000`;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (pageTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(pageTheme);
    }
  }, [pageTheme, adminSidebarTheme, userSidebarTheme, mounted]);

  return (
    <ThemeContext.Provider value={{
      pageTheme, setPageTheme,
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
