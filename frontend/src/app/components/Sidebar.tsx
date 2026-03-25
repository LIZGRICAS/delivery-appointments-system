"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, BarChart2, LogOut, Package } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Citas", href: "/appointments", icon: Calendar },
  { label: "Reportes", href: "/reports", icon: BarChart2 },
];

export default function Sidebar({ user }: { user?: { name: string; role: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <aside className="w-44 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <div className="bg-black rounded-md p-1.5">
          <Package size={16} className="text-white" />
        </div>
        <span className="font-bold text-sm">RetailCitas</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {label}
            </a>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        {user && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {user.name.charAt(0)}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 text-xs font-medium hover:text-red-600"
        >
          <LogOut size={14} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
