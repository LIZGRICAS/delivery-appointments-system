"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

function parseJwtUsername(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.username ?? payload.user_id ?? "Usuario";
  } catch {
    return "Usuario";
  }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: "Usuario", role: "Operador" });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setUser({ name: parseJwtUsername(token), role: "Operador" });
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static z-30 h-full transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar user={user} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm">RetailCitas</span>
        </div>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
