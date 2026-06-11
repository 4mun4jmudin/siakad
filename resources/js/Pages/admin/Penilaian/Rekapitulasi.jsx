import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  PrinterIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  UserIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  UserMinusIcon,
  StarIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/solid";

// Colors
const PREDIKAT_COLORS = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#f43f5e",
  E: "#ec4899",
};
const PREDIKAT_LABELS = {
  A: "A (Sangat Baik)",
  B: "B (Baik)",
  C: "C (Cukup)",
  D: "D (Kurang)",
  E: "E (Sangat Kurang)",
};

export default function PageRekapitulasiNilai({ filters = {}, options = {}, data = null }) {
  const [f, setF] = useState({
    id_tahun_ajaran: filters?.id_tahun_ajaran || "",
    semester: filters?.semester || "",
    id_kelas: filters?.id_kelas || "",
    id_mapel: filters?.id_mapel || "",
    guru: filters?.guru || "",
  });

  const onApplyFilter = (e) => {
    e?.preventDefault?.();
    router.get(route("admin.penilaian.rekapitulasi.index"), f, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const onResetFilter = () => {
    router.get(route("admin.penilaian.rekapitulasi.index"), {
      id_tahun_ajaran: filters?.id_tahun_ajaran || "",
      semester: filters?.semester || "",
    });
  };

  const getExportUrl = (type) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(f).filter(([_, v]) => v !== ""))
    ).toString();
    return route(`admin.penilaian.rekapitulasi.export.${type}`) + (qs ? `?${qs}` : "");
  };

  // Data mappings
  const summary = data?.summary || {};
  const breakdown = data?.breakdown || { predikat: {}, tuntas: { ya: 0, tidak: 0 } };
  
  const donutData = useMemo(() => {
    return Object.entries(breakdown.predikat || {})
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => {
         const total = summary.total_header || 1;
         return {
           name: PREDIKAT_LABELS[k] || k,
           rawName: k,
           value: v,
           percentage: ((v / total) * 100).toFixed(1) + "%",
           color: PREDIKAT_COLORS[k] || "#9ca3af",
         };
      });
  }, [breakdown, summary]);

  const barData = (data?.kelas || []).slice(0, 10).map((k) => ({
    name: k.nama_kelas || k.id_kelas,
    ketuntasan: k.pass_rate_pct || 0,
  }));

  const lineData = (data?.trend || []).map((t) => ({
    month: t.period,
    value: t.avg_nilai || 0,
  }));

  const tableKelas = data?.kelas || [];
  const topMapel = data?.mapel ? data.mapel.slice(0, 5) : [];
  const bottomMapel = data?.mapel ? [...data.mapel].reverse().slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <Head title="Rekapitulasi Nilai" />

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekapitulasi Nilai</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan hasil penilaian untuk monitoring capaian akademik siswa.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={getExportUrl('excel')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export Excel
          </a>
          <a
            href={getExportUrl('pdf')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4" />
            Export PDF
          </a>
          <div className="flex">
            <button className="inline-flex items-center gap-2 pl-4 pr-3 py-2 bg-indigo-600 text-white rounded-l-lg text-sm font-medium hover:bg-indigo-700 transition-colors" onClick={() => window.print()}>
              <PrinterIcon className="w-4 h-4" />
              Cetak Rekap
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={onApplyFilter} className="flex flex-wrap items-end gap-4">
          <FilterSelect label="Tahun Ajaran" value={f.id_tahun_ajaran} onChange={(v) => setF({ ...f, id_tahun_ajaran: v })} options={options.tahunAjaran} />
          <FilterSelect label="Semester" value={f.semester} onChange={(v) => setF({ ...f, semester: v })} options={options.semester} />
          <FilterSelect label="Kelas" value={f.id_kelas} onChange={(v) => setF({ ...f, id_kelas: v })} options={options.kelas} />
          <FilterSelect label="Mata Pelajaran" value={f.id_mapel} onChange={(v) => setF({ ...f, id_mapel: v })} options={options.mapel} />
          <FilterSelect label="Guru" value={f.guru} onChange={(v) => setF({ ...f, guru: v })} options={options.guru} />
          <div className="flex items-center gap-2 pb-0.5">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              <FunnelIcon className="w-4 h-4" /> Filter
            </button>
            <button type="button" onClick={onResetFilter} className="inline-flex items-center gap-2 px-5 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <ArrowPathIcon className="w-4 h-4" /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* 3. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard icon={<UserIcon className="w-6 h-6" />} iconColor="text-blue-500" iconBg="bg-blue-100" label="Total Penilaian" value={summary.total_header || 0} subtext="Entri" />
        <KPICard icon={<ChartBarIcon className="w-6 h-6" />} iconColor="text-emerald-500" iconBg="bg-emerald-100" label="Rata-rata Sekolah" value={summary.avg_nilai ? summary.avg_nilai.toFixed(2) : "0"} />
        <KPICard icon={<CheckBadgeIcon className="w-6 h-6" />} iconColor="text-indigo-500" iconBg="bg-indigo-100" label="Ketuntasan" value={`${summary.tuntas_pct || 0}%`} subtext={`${breakdown.tuntas?.ya || 0} Tuntas`} />
        <KPICard icon={<UserMinusIcon className="w-6 h-6" />} iconColor="text-orange-500" iconBg="bg-orange-100" label="Belum Tuntas" value={breakdown.tuntas?.tidak || 0} />
        <KPICard icon={<StarIcon className="w-6 h-6" />} iconColor="text-blue-600" iconBg="bg-blue-100" label="Nilai Dipublish" value={summary.published || 0} />
        <KPICard icon={<ArrowDownIcon className="w-6 h-6" />} iconColor="text-red-500" iconBg="bg-red-100" label="Draft Nilai" value={summary.draft || 0} />
      </div>

      {/* 4. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Distribusi Predikat Nilai</h3>
          <div className="flex items-center justify-between">
            <div className="w-48 h-48 relative -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-gray-800">{summary.total_header || 0}</span>
                <span className="text-[10px] text-gray-500">Total Nilai</span>
              </div>
            </div>
            <div className="space-y-3">
              {donutData.map((item, idx) => (
                <div key={idx} className="flex items-center text-xs">
                  <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600 w-20">{item.rawName}</span>
                  <span className="font-semibold text-gray-800 w-10 text-right">{item.value}</span>
                  <span className="text-gray-400 w-12 text-right">({item.percentage})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Ketuntasan per Kelas</h3>
          </div>
          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 15, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="ketuntasan" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20}>
                  <LabelList dataKey="ketuntasan" position="top" formatter={(val) => `${val}%`} fill="#4b5563" fontSize={10} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Tren Rata-rata Nilai</h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <div className="w-3 h-1 bg-indigo-600 rounded"></div> Rata-rata
            </div>
          </div>
          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }} activeDot={{ r: 6 }}>
                   <LabelList dataKey="value" position="top" fill="#6b7280" fontSize={10} offset={10} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex border-b border-gray-200 pt-2 px-2 overflow-x-auto custom-scrollbar">
            <button className="px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors border-indigo-600 text-indigo-600">
              Rekap per Kelas
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-center align-middle border-b border-gray-200">No</th>
                  <th className="px-5 py-3 align-middle border-b border-gray-200">Kelas</th>
                  <th className="px-5 py-3 text-center align-middle border-b border-gray-200">Rata-rata</th>
                  <th className="px-5 py-3 text-center border-b border-gray-200">Ketuntasan (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableKelas.length > 0 ? tableKelas.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{row.nama_kelas}</td>
                    <td className="px-5 py-3 text-center font-medium text-gray-800">{row.avg_nilai}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{row.pass_rate_pct}%</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-500">Tidak ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 text-sm">Top Mapel (Rata-rata Tertinggi)</h3>
              </div>
              <table className="w-full text-xs">
                <thead className="text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="pb-2 font-medium text-left w-6">No</th>
                    <th className="pb-2 font-medium text-left">Mata Pelajaran</th>
                    <th className="pb-2 font-medium text-right">Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topMapel.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-gray-400">{idx + 1}</td>
                      <td className="py-2.5 font-medium text-gray-700">{item.nama_mapel}</td>
                      <td className="py-2.5 text-right font-medium text-gray-800">{item.avg_nilai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 text-sm">Bottom Mapel (Rata-rata Terendah)</h3>
              </div>
              <table className="w-full text-xs">
                <thead className="text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="pb-2 font-medium text-left w-6">No</th>
                    <th className="pb-2 font-medium text-left">Mata Pelajaran</th>
                    <th className="pb-2 font-medium text-right">Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bottomMapel.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-gray-400">{idx + 1}</td>
                      <td className="py-2.5 font-medium text-gray-700">{item.nama_mapel}</td>
                      <td className="py-2.5 text-right font-medium text-gray-800">{item.avg_nilai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PageRekapitulasiNilai.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Rekapitulasi Nilai">
    {page}
  </AdminLayout>
);

function FilterSelect({ label, value, onChange, options = [] }) {
  return (
    <div className="min-w-[140px] flex-1">
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8 shadow-sm"
        >
          <option value="">Semua {label}</option>
          {(options || []).map((o, idx) => (
            <option key={idx} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function KPICard({ icon, iconColor, iconBg, label, value, subtext }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${iconBg} ${iconColor} shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}
