'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, RefreshCw } from 'lucide-react';
import AppShell from '../components/AppShell';

export default function ReportsPage() {
  const [reportData, setReportData] = useState([]);
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-12-31');
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/appointments/report/?date_from=${dateFrom}&date_to=${dateTo}`);
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={22} /> Reporte de Tiempos de Entrega
        </h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Desde</label>
          <input
            type="date"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hasta</label>
          <input
            type="date"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
          <h2 className="text-xl font-semibold mb-6">Promedio de Horas por Sublínea</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product_line" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_hours" fill="#4f46e5" name="Horas Promedio" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Detalle de Entregas</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sublínea</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minutos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((row: any) => (
                <tr key={row.product_line}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.product_line}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.total_deliveries}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Number(row.avg_hours).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Number(row.avg_minutes).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
