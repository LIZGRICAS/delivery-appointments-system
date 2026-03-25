"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import AppShell from "../../../components/AppShell";
import AppointmentForm from "../../../components/AppointmentForm";

export default function EditAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/appointments/${id}/`).then((res) => {
      const a = res.data;
      setData({
        id: a.id,
        scheduled_at: a.scheduled_at?.slice(0, 16) ?? "",
        supplier: a.supplier,
        product_line: a.product_line,
        status: a.status,
        delivered_at: a.delivered_at?.slice(0, 16) ?? "",
        observations: a.observations ?? "",
      });
    }).finally(() => setLoading(false));
  }, [id]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Cita</h1>
        <p className="text-sm text-gray-500 mt-1">Modifica los datos de la cita.</p>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : data ? (
        <AppointmentForm initialData={data} isEdit />
      ) : (
        <p className="text-sm text-red-500">No se encontró la cita.</p>
      )}
    </AppShell>
  );
}
