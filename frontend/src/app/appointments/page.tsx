"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AppShell from "../components/AppShell";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface Appointment {
  id: string;
  scheduled_at: string;
  supplier: string;
  product_line: string;
  status: string;
  delivered_at: string | null;
  observations: string | null;
  created_by: string;
}

const STATUS_COLORS: Record<string, string> = {
  Programada: "bg-blue-100 text-blue-700",
  "En proceso": "bg-yellow-100 text-yellow-700",
  Entregada: "bg-green-100 text-green-700",
  Cancelada: "bg-red-100 text-red-700",
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    supplier: "",
    product_line: "",
    status: "",
    date_from: "",
    date_to: "",
  });

  const fetchAppointments = async (currentPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage) });
      if (filters.supplier) params.append("supplier", filters.supplier);
      if (filters.product_line) params.append("product_line", filters.product_line);
      if (filters.status) params.append("status", filters.status);
      if (filters.date_from) params.append("scheduled_at__gte", filters.date_from);
      if (filters.date_to) params.append("scheduled_at__lte", filters.date_to);

      const res = await api.get(`/appointments/?${params}`);
      const data = res.data;
      setAppointments(data.results ?? data);
      if (data.count) setTotalPages(Math.ceil(data.count / 10));
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(page);
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchAppointments(1);
  };

  const handleCancel = async (id: string) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    await api.patch(`/appointments/${id}/`, { status: "Cancelada" });
    fetchAppointments(page);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las citas de entrega.</p>
        </div>
        <button
          onClick={() => router.push("/appointments/new")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Nueva Cita
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <select
          value={filters.supplier}
          onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos los proveedores</option>
          <option value="A">Proveedor A</option>
          <option value="B">Proveedor B</option>
          <option value="C">Proveedor C</option>
        </select>

        <select
          value={filters.product_line}
          onChange={(e) => setFilters({ ...filters, product_line: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todas las sublíneas</option>
          <option value="Camisetas">Camisetas</option>
          <option value="Pantalones">Pantalones</option>
          <option value="Zapatos">Zapatos</option>
          <option value="Accesorios">Accesorios</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">Todos los estados</option>
          <option value="Programada">Programada</option>
          <option value="En proceso">En proceso</option>
          <option value="Entregada">Entregada</option>
          <option value="Cancelada">Cancelada</option>
        </select>

        <button
          onClick={handleFilter}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Filtrar
        </button>
      </div>

      {/* Date filters */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 pb-4 -mt-3 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Desde</label>
          <input type="date" value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Hasta</label>
          <input type="date" value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Fecha", "Proveedor", "Sublínea", "Estado", "Creado por", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Cargando...</td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No hay citas.</td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(a.scheduled_at).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Proveedor {a.supplier}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{a.product_line}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{a.created_by}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => router.push(`/appointments/${a.id}/edit`)}
                      className="text-xs text-black underline hover:no-underline"
                    >
                      Editar
                    </button>
                    {a.status !== "Cancelada" && a.status !== "Entregada" && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="text-xs text-red-500 underline hover:no-underline"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
