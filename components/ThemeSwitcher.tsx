"use client";

import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Palette, Monitor } from "lucide-react";
import { HexAlphaColorPicker } from "react-colorful";
import { useTheme } from "@/components/providers/ThemeProvider";
import { updateThemeSettings, getUserProfile } from "@/app/actions/user";

interface ThemeSwitcherProps {
  panelType: "admin" | "user";
}

export default function ThemeSwitcher({ panelType }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebarColorPicker, setShowSidebarColorPicker] = useState(false);
  const [showPageColorPicker, setShowPageColorPicker] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  
  const { 
    adminPageTheme, setAdminPageTheme,
    userPageTheme, setUserPageTheme, 
    adminSidebarTheme, setAdminSidebarTheme, 
    userSidebarTheme, setUserSidebarTheme,
    broadcastThemeUpdate
  } = useTheme();

  const currentSidebarTheme = panelType === "admin" ? adminSidebarTheme : userSidebarTheme;
  const currentPageTheme = panelType === "admin" ? adminPageTheme : userPageTheme;
  const handlePageChange = (theme: string, shouldBroadcast: boolean = false) => {
    if (panelType === "admin") {
      setAdminPageTheme(theme);
      if (shouldBroadcast) broadcastThemeUpdate("adminPage", theme);
    } else {
      setUserPageTheme(theme);
      if (shouldBroadcast) broadcastThemeUpdate("userPage", theme);
    }
  };
  
  const handleSidebarChange = (theme: string, shouldBroadcast: boolean = false) => {
    if (panelType === "admin") {
      setAdminSidebarTheme(theme);
      if (shouldBroadcast) broadcastThemeUpdate("admin", theme);
    } else {
      setUserSidebarTheme(theme);
      if (shouldBroadcast) broadcastThemeUpdate("user", theme);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("recentThemeColors");
    if (saved) {
      try { setRecentColors(JSON.parse(saved)); } catch (e) {}
    }
    
    getUserProfile().then(user => {
      let colorsStr = "[]";
      if (user?.role === "admin" && (user as any).recentColors) {
         colorsStr = (user as any).recentColors;
      } else if (user?.role === "user" && user.profile?.recentColors) {
         colorsStr = user.profile.recentColors;
      }
      if (colorsStr && colorsStr !== "[]") {
        try {
          const parsed = JSON.parse(colorsStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRecentColors(parsed);
            localStorage.setItem("recentThemeColors", JSON.stringify(parsed));
          }
        } catch(e) {}
      }
    });
  }, []);

  const handleCustomColorBlur = (color: string, target: 'sidebar' | 'page') => {
    if (!color.startsWith("#")) return;
    
    let newColors = recentColors;
    if (!recentColors.includes(color)) {
      newColors = [color, ...recentColors].slice(0, 5); // keep 5 recent colors
      setRecentColors(newColors);
      localStorage.setItem("recentThemeColors", JSON.stringify(newColors));
    }
    
    if (target === 'sidebar') {
      updateThemeSettings(color, newColors, panelType, undefined).catch(console.error);
      handleSidebarChange(color, true);
    } else {
      updateThemeSettings(null, newColors, panelType, color).catch(console.error);
      handlePageChange(color, true);
    }
  };

  const [sidebarHexInput, setSidebarHexInput] = useState(
    currentSidebarTheme?.startsWith("#") ? currentSidebarTheme : "#000000"
  );
  const [pageHexInput, setPageHexInput] = useState(
    currentPageTheme?.startsWith("#") ? currentPageTheme : "#000000"
  );
  
  useEffect(() => {
    setSidebarHexInput((prev: string) => currentSidebarTheme?.startsWith("#") && currentSidebarTheme !== prev ? currentSidebarTheme : prev);
    setPageHexInput((prev: string) => currentPageTheme?.startsWith("#") && currentPageTheme !== prev ? currentPageTheme : prev);
  }, [currentSidebarTheme, currentPageTheme]);

  const lastBroadcastRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHexInputChange = (val: string, target: 'sidebar' | 'page') => {
    const now = Date.now();
    const shouldThrottleBroadcast = now - lastBroadcastRef.current > 150; 

    // Update local inputs immediately for smooth typing/dragging
    if (target === 'sidebar') {
      setSidebarHexInput(val);
    } else {
      setPageHexInput(val);
    }

    const broadcast = () => {
      if (target === 'sidebar') {
        if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(val)) {
          handleSidebarChange(val, true);
        }
      } else {
        if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(val)) {
          handlePageChange(val, true);
        }
      }
      lastBroadcastRef.current = Date.now();
    };

    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(val)) {
      if (shouldThrottleBroadcast) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        broadcast();
      } else {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(broadcast, 150);
      }
    }
  };

  const handleOpacityChange = (opacityPercent: number, target: 'sidebar' | 'page') => {
    let baseHex = target === 'sidebar' ? sidebarHexInput : pageHexInput;
    if (!baseHex.startsWith("#")) baseHex = "#000000";
    
    if (baseHex.length === 4) {
      baseHex = "#" + baseHex[1]+baseHex[1] + baseHex[2]+baseHex[2] + baseHex[3]+baseHex[3];
    } else if (baseHex.length === 5) {
      baseHex = "#" + baseHex[1]+baseHex[1] + baseHex[2]+baseHex[2] + baseHex[3]+baseHex[3];
    } else if (baseHex.length > 7) {
      baseHex = baseHex.slice(0, 7);
    }
    
    const alphaHex = Math.round((opacityPercent / 100) * 255).toString(16).padStart(2, '0');
    const newHex = baseHex + alphaHex;
    
    if (target === 'sidebar') {
      setSidebarHexInput(newHex);
      handleSidebarChange(newHex);
    } else {
      setPageHexInput(newHex);
      handlePageChange(newHex);
    }
  };
  
  const getOpacityPercent = (target: 'sidebar' | 'page') => {
    const hex = target === 'sidebar' ? sidebarHexInput : pageHexInput;
    if (!hex.startsWith("#")) return 100;
    if (hex.length === 5) {
      const a = hex[4] + hex[4];
      return Math.round((parseInt(a, 16) / 255) * 100);
    }
    if (hex.length === 9) {
      const a = hex.slice(7, 9);
      return Math.round((parseInt(a, 16) / 255) * 100);
    }
    return 100;
  };

  const sidebarOptions = [
    { value: "default", label: "Default", color: "bg-card border border-border" },
    { value: "purple", label: "Purple", color: "bg-[#5B21B6]" },
    { value: "green", label: "Green", color: "bg-[#16A34A]" },
    { value: "blue", label: "Blue", color: "bg-blue-600" },
    { value: "dark", label: "Dark", color: "bg-gray-900" },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        title="Theme Settings"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 mt-2 w-64 max-h-[80vh] overflow-y-auto bg-card border border-border rounded-xl shadow-lg z-50 p-4 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
            
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Page Theme</h3>
              <div className="flex bg-muted rounded-lg p-1 mb-2">
                <button
                  onClick={() => { 
                    handlePageChange("light", true);
                    updateThemeSettings(null, recentColors, panelType, "light").catch(console.error);
                  }}
                  className={`flex-1 flex justify-center py-1.5 rounded-md text-xs font-medium transition-colors ${currentPageTheme === "light" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Sun className="w-4 h-4 mr-1" /> Light
                </button>
                <button
                  onClick={() => { 
                    handlePageChange("dark", true);
                    updateThemeSettings(null, recentColors, panelType, "dark").catch(console.error);
                  }}
                  className={`flex-1 flex justify-center py-1.5 rounded-md text-xs font-medium transition-colors ${currentPageTheme === "dark" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Moon className="w-4 h-4 mr-1" /> Dark
                </button>
                <button
                  onClick={() => { 
                    handlePageChange("system", true);
                    updateThemeSettings(null, recentColors, panelType, "system").catch(console.error);
                  }}
                  className={`flex-1 flex justify-center py-1.5 rounded-md text-xs font-medium transition-colors ${currentPageTheme === "system" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Monitor className="w-4 h-4 mr-1" /> Auto
                </button>
              </div>

              {/* Page Custom Color Picker Toggle */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Custom Color:</span>
                <div 
                  className={`w-8 h-8 rounded-full border border-border overflow-hidden cursor-pointer relative ${showPageColorPicker ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`} 
                  title="Pick Custom Color for Page"
                  onClick={() => setShowPageColorPicker(!showPageColorPicker)}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 pointer-events-none" />
                </div>
              </div>

              {/* Inline Custom Color Picker via react-colorful for Page Theme */}
              {showPageColorPicker && (
                <div className="mb-3 p-3 bg-muted/50 border border-border rounded-xl">
                  <style>{`
                    .custom-color-picker { width: 100% !important; height: 150px !important; }
                    .custom-color-picker .react-colorful__pointer { width: 16px !important; height: 16px !important; }
                  `}</style>
                  <HexAlphaColorPicker 
                    color={pageHexInput} 
                    onChange={(color) => handleHexInputChange(color, 'page')}
                    className="custom-color-picker"
                  />
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => {
                        setShowPageColorPicker(false);
                        handleCustomColorBlur(pageHexInput, 'page');
                      }}
                      className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Custom HEX Input & Opacity Slider for Page */}
              <div className="mt-3 p-3 bg-muted rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">HEX Color</label>
                  <input 
                    type="text" 
                    value={pageHexInput}
                    onChange={(e) => handleHexInputChange(e.target.value, 'page')}
                    onBlur={() => handleCustomColorBlur(pageHexInput, 'page')}
                    placeholder="#RRGGBB"
                    className="w-24 text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Opacity</label>
                    <span className="text-xs text-muted-foreground">{getOpacityPercent('page')}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={getOpacityPercent('page')}
                    onChange={(e) => handleOpacityChange(parseInt(e.target.value), 'page')}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Sidebar Color</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {sidebarOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleSidebarChange(option.value, true);
                      updateThemeSettings(option.value, recentColors, panelType, undefined).catch(console.error);
                    }}
                    title={option.label}
                    className={`w-8 h-8 rounded-full border border-border flex items-center justify-center ${option.color} ${currentSidebarTheme === option.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`}
                  >
                  </button>
                ))}
                
                {/* Custom Color Picker Toggle */}
                <div 
                  className={`w-8 h-8 rounded-full border border-border overflow-hidden cursor-pointer relative ${showSidebarColorPicker ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`} 
                  title="Pick Custom Color"
                  onClick={() => setShowSidebarColorPicker(!showSidebarColorPicker)}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 pointer-events-none" />
                </div>
              </div>

              {/* Inline Custom Color Picker via react-colorful for Sidebar */}
              {showSidebarColorPicker && (
                <div className="mb-3 p-3 bg-muted/50 border border-border rounded-xl">
                  <style>{`
                    .custom-color-picker { width: 100% !important; height: 150px !important; }
                    .custom-color-picker .react-colorful__pointer { width: 16px !important; height: 16px !important; }
                  `}</style>
                  <HexAlphaColorPicker 
                    color={sidebarHexInput} 
                    onChange={(color) => handleHexInputChange(color, 'sidebar')}
                    className="custom-color-picker"
                  />
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => {
                        setShowSidebarColorPicker(false);
                        handleCustomColorBlur(sidebarHexInput, 'sidebar');
                      }}
                      className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Custom HEX Input & Opacity Slider for Sidebar */}
              <div className="mt-3 p-3 bg-muted rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">HEX Color</label>
                  <input 
                    type="text" 
                    value={sidebarHexInput}
                    onChange={(e) => handleHexInputChange(e.target.value, 'sidebar')}
                    onBlur={() => handleCustomColorBlur(sidebarHexInput, 'sidebar')}
                    placeholder="#RRGGBB"
                    className="w-24 text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Opacity</label>
                    <span className="text-xs text-muted-foreground">{getOpacityPercent('sidebar')}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={getOpacityPercent('sidebar')}
                    onChange={(e) => handleOpacityChange(parseInt(e.target.value), 'sidebar')}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              {recentColors.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Recent Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {recentColors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                           handleSidebarChange(color);
                           handlePageChange(color, true);
                           updateThemeSettings(color, recentColors, panelType, color).catch(console.error);
                        }}
                        title={color}
                        className={`w-6 h-6 rounded-full border border-border ${currentSidebarTheme === color || currentPageTheme === color ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Applies to both Page and Sidebar</p>
                </div>
              )}
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}
