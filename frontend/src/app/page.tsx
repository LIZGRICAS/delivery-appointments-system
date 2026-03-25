"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import AppShell from "./components/AppShell";

interface Stats {
  today: number;
  programada: number;
  entregada: number;
  cancelada: number;
}

interface Appointment {
  id: number;
  status: string;
  scheduled_at: string;
  supplier?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ today: 0, programada: 0, entregada: 0, cancelada: 0 });
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [recent, setRecent] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/appointments/");
        const all: Appointment[] = res.data.results ?? res.data;
        const today = new Date().toISOString().split("T")[0];
        const todayList = all.filter((a) => a.scheduled_at?.startsWith(today));
        setTodayAppts(todayList);
        setRecent(all.slice(0, 5));
        setStats({
          today: todayList.length,
          programada: all.filter((a) => a.status === "Programada").length,
          entregada: all.filter((a) => a.status === "Entregada").length,
          cancelada: all.filter((a) => a.status === "Cancelada").length,
        });
      } catch {
        // silently fail — user sees zeros
      }
    };
    fetchData();
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen operativo del sistema de entregas.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Citas Hoy" value={stats.today} icon={<Calendar size={18} className="text-gray-400" />} />
        <StatCard label="Programadas" value={stats.programada} icon={<Clock size={18} className="text-gray-400" />} />
        <StatCard label="Entregadas" value={stats.entregada} icon={<CheckCircle size={18} className="text-green-400" />} />
        <StatCard label="Canceladas" value={stats.cancelada} icon={<XCircle size={18} className="text-red-400" />} />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Citas para hoy</h2>
          {todayAppts.length === 0 ? (
            <p className="text-sm text-gray-400">No hay citas programadas para hoy.</p>
          ) : (
            <ul className="space-y-2">
              {todayAppts.map((a) => (
                <li key={a.id} className="text-sm text-gray-700 flex justify-between">
                  <span>Proveedor {a.supplier} — Cita #{String(a.id).slice(0, 8)}</span>
                  <span className="text-gray-400">{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Última actividad</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400">Sin actividad reciente.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((a) => (
                <li key={a.id} className="text-sm text-gray-700 flex justify-between">
                  <span>Proveedor {a.supplier} — Cita #{String(a.id).slice(0, 8)}</span>
                  <span className="text-gray-400">{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{label}</span>
        {icon}
      </div>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
  );
}
