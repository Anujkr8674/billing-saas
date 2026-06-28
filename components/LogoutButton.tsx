"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-danger rounded-lg hover:bg-danger/10 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
