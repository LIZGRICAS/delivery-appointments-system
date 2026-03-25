"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface FormData {
  scheduled_at: string;
  supplier: string;
  product_line: string;
  status: string;
  delivered_at: string;
  observations: string;
}

interface Props {
  initialData?: Partial<FormData> & { id?: string };
  isEdit?: boolean;
}

const EMPTY: FormData = {
  scheduled_at: "",
  supplier: "A",
  product_line: "Camisetas",
  status: "Programada",
  delivered_at: "",
  observations: "",
};

export default function AppointmentForm({ initialData, isEdit = false }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload: Record<string, string | null> = {
      scheduled_at: form.scheduled_at,
      supplier: form.supplier,
      product_line: form.product_line,
      status: form.status,
      delivered_at: form.delivered_at || null,
      observations: form.observations || null,
    };

    try {
      if (isEdit && initialData?.id) {
        await api.patch(`/appointments/${initialData.id}/`, payload);
      } else {
        await api.post("/appointments/", payload);
      }
      router.push("/appointments");
    } catch (err: any) {
      const data = err?.response?.data ?? {};
      const mapped: Record<string, string> = {};
      for (const key of Object.keys(data)) {
        mapped[key] = Array.isArray(data[key]) ? data[key][0] : String(data[key]);
      }
      setErrors(mapped);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg flex flex-col gap-5">
      <Field label="Fecha y hora programada" error={errors.scheduled_at}>
        <input
          type="datetime-local"
          value={form.scheduled_at}
          onChange={(e) => set("scheduled_at", e.target.value)}
          required
          className={input(errors.scheduled_at)}
        />
      </Field>

      <Field label="Proveedor" error={errors.supplier}>
        <select value={form.supplier} onChange={(e) => set("supplier", e.target.value)} className={input(errors.supplier)}>
          <option value="A">Proveedor A</option>
          <option value="B">Proveedor B</option>
          <option value="C">Proveedor C</option>
        </select>
      </Field>

      <Field label="Sublínea de producto" error={errors.product_line}>
        <select value={form.product_line} onChange={(e) => set("product_line", e.target.value)} className={input(errors.product_line)}>
          <option value="Camisetas">Camisetas</option>
          <option value="Pantalones">Pantalones</option>
          <option value="Zapatos">Zapatos</option>
          <option value="Accesorios">Accesorios</option>
        </select>
      </Field>

      <Field label="Estado" error={errors.status}>
        <select value={form.status} onChange={(e) => set("status", e.target.value)} className={input(errors.status)}>
          <option value="Programada">Programada</option>
          <option value="En proceso">En proceso</option>
          <option value="Entregada">Entregada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </Field>

      {form.status === "Entregada" && (
        <Field label="Fecha y hora de entrega real" error={errors.delivered_at}>
          <input
            type="datetime-local"
            value={form.delivered_at}
            onChange={(e) => set("delivered_at", e.target.value)}
            required
            className={input(errors.delivered_at)}
          />
        </Field>
      )}

      <Field label="Observaciones (opcional)" error={errors.observations}>
        <textarea
          value={form.observations}
          onChange={(e) => set("observations", e.target.value)}
          rows={3}
          className={input(errors.observations)}
        />
      </Field>

      {errors.non_field_errors && (
        <p className="text-red-500 text-sm">{errors.non_field_errors}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cita"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/appointments")}
          className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function input(error?: string) {
  return `border ${error ? "border-red-400" : "border-gray-200"} rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
