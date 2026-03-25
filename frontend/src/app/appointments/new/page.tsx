"use client";

import AppShell from "../../components/AppShell";
import AppointmentForm from "../../components/AppointmentForm";

export default function NewAppointmentPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Cita</h1>
        <p className="text-sm text-gray-500 mt-1">Registra una nueva cita de entrega.</p>
      </div>
      <AppointmentForm />
    </AppShell>
  );
}
