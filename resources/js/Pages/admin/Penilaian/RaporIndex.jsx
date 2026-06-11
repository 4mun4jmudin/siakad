import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  PrinterIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline";

/* ========================================================================== */
/*  MAIN COMPONENT                                                            */
/* ========================================================================== */

export default function PageLaporanNilai({ options, filters, items }) {
  const [f, setF] = useState({
    id_tahun_ajaran: filters?.id_tahun_ajaran || "",
    semester: filters?.semester || "",
    id_kelas: filters?.id_kelas || "",
  });
  
  const [search, setSearch] = useState("");

  const onApplyFilter = (e) => {
    e?.preventDefault?.();
    router.get(route("admin.rapor.index"), f, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const onResetFilter = () => {
    router.get(route("admin.rapor.index"), {
      id_tahun_ajaran: filters?.id_tahun_ajaran || "",
      semester: filters?.semester || "",
    });
  };

  const hitungRapor = () => {
    if (!f.id_tahun_ajaran || !f.semester || !f.id_kelas) {
      alert("Pilih Tahun Ajaran, Semester, dan Kelas terlebih dahulu.");
      return;
    }
    if (confirm("Hitung ulang rata-rata dan peringkat kelas ini?")) {
      router.post(route("admin.rapor.recompute"), f);
    }
  };

  const exportLeger = () => {
    if (!f.id_tahun_ajaran || !f.semester || !f.id_kelas) {
      alert("Pilih Tahun Ajaran, Semester, dan Kelas terlebih dahulu.");
      return;
    }
    window.location.href = route('admin.rapor.export.excel', f);
  };

  const cetakPdf = (id_siswa) => {
    const params = new URLSearchParams({ ...f, id_siswa }).toString();
    window.open(`${route('admin.rapor.export.pdf')}?${params}`, '_blank');
  };

  const filteredItems = (items || []).filter(i => 
    i.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || 
    i.nis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Head title="Laporan Nilai (Rapor)" />

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Laporan Nilai (Rapor & Leger)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola peringkat kelas, cetak Rapor (PDF), dan unduh Leger Nilai (Excel).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportLeger} className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors">
            <DocumentArrowDownIcon className="w-4 h-4" />
            Cetak Leger (Excel)
          </button>
          <button onClick={hitungRapor} className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">
            <CalculatorIcon className="w-4 h-4" />
            Hitung Rapor / Peringkat
          </button>
        </div>
      </div>

      {/* 2. FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <form onSubmit={onApplyFilter} className="flex flex-wrap items-end gap-4">
          <FilterSelect label="Tahun Ajaran" value={f.id_tahun_ajaran} onChange={v => setF({...f, id_tahun_ajaran: v})} options={options.tahunAjaran} />
          <FilterSelect label="Semester" value={f.semester} onChange={v => setF({...f, semester: v})} options={options.semester} />
          <FilterSelect label="Kelas" value={f.id_kelas} onChange={v => setF({...f, id_kelas: v})} options={options.kelas} />
          
          <div className="flex items-center gap-2 pb-0.5">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <FunnelIcon className="w-4 h-4" />
              Tampilkan
            </button>
            <button type="button" onClick={onResetFilter} className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Table) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-gray-800 text-lg">Daftar Peringkat & Rapor Kelas</h3>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari nama / NIS..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border-gray-300 rounded-lg text-sm py-2 px-3 pl-9 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                  <tr>
                    <th className="px-5 py-4 w-16 text-center">Peringkat</th>
                    <th className="px-5 py-4 w-32 text-center">NIS</th>
                    <th className="px-5 py-4">Nama Siswa</th>
                    <th className="px-5 py-4 w-32 text-center">Rata-rata</th>
                    <th className="px-5 py-4 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.length > 0 ? filteredItems.map((row) => (
                    <tr key={row.id_siswa} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-center font-bold text-gray-800">{row.peringkat}</td>
                      <td className="px-5 py-4 text-center text-gray-500">{row.nis}</td>
                      <td className="px-5 py-4 text-gray-800 font-medium">{row.nama_lengkap}</td>
                      <td className="px-5 py-4 text-center text-blue-600 font-bold">{row.rata_rata}</td>
                      <td className="px-5 py-4 text-center">
                        <button 
                          onClick={() => cetakPdf(row.id_siswa)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded text-xs font-medium transition-colors"
                        >
                          <PrinterIcon className="w-3.5 h-3.5" />
                          Rapor PDF
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        {items && items.length === 0 ? "Belum ada data rapor. Silakan klik 'Hitung Rapor / Peringkat' atau pastikan kelas memiliki siswa dan nilai." : "Silakan pilih kelas terlebih dahulu."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebars) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 relative overflow-hidden">
             <div className="flex items-center gap-2 mb-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Petunjuk</h4>
             </div>
             <ul className="text-xs text-blue-800 space-y-2 pl-4 list-disc marker:text-blue-400">
                <li>Pastikan semua nilai akhir (termasuk remedial) sudah masuk sebelum menghitung rapor.</li>
                <li>Klik tombol <b>Hitung Rapor / Peringkat</b> untuk mengakumulasi rata-rata dan menentukan peringkat kelas.</li>
                <li>Gunakan <b>Cetak Leger (Excel)</b> untuk mendownload rekap matriks nilai seluruh siswa.</li>
                <li>Untuk siswa individu, gunakan tombol <b>Rapor PDF</b>.</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

PageLaporanNilai.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Laporan Nilai">
    {page}
  </AdminLayout>
);

/* ========================================================================== */
/*  HELPER COMPONENTS                                                         */
/* ========================================================================== */

function FilterSelect({ label, value, onChange, options = [] }) {
  return (
    <div className="min-w-[140px] flex-1">
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <select 
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 shadow-sm"
        >
          <option value="">— Pilih —</option>
          {options.map((o, idx) => (
            <option key={idx} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
