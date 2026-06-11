import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import {
  UserGroupIcon,
  CheckCircleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

/* ========================================================================== */
/*  MODAL COMPONENT                                                           */
/* ========================================================================== */
function RemedialModal({ show, onClose, data, type }) {
  if (!show) return null;

  const { data: formData, setData, post, processing, errors, reset } = useForm({
    id_penilaian: data?.id_penilaian || "",
    nilai_awal: data?.nilai_awal_rem || data?.nilai_akhir || "",
    tanggal: data?.jadwal_raw || "",
    nilai_remedial: data?.nilai_remedial || "",
    catatan: data?.catatan || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.remedial.store"), {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {type === 'jadwal' ? 'Jadwalkan Remedial' : 'Input Nilai Remedial'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
            <input type="text" disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" value={data?.nama || ''} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Awal</label>
              <input type="number" disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" value={formData.nilai_awal} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KKM</label>
              <input type="number" disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500" value={data?.kkm || ''} />
            </div>
          </div>

          {type === 'jadwal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Remedial</label>
              <input 
                type="date" 
                className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={formData.tanggal}
                onChange={e => setData('tanggal', e.target.value)}
              />
              {errors.tanggal && <p className="mt-1 text-xs text-red-500">{errors.tanggal}</p>}
            </div>
          )}

          {type === 'nilai' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Remedial</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={formData.nilai_remedial}
                onChange={e => setData('nilai_remedial', e.target.value)}
              />
              {errors.nilai_remedial && <p className="mt-1 text-xs text-red-500">{errors.nilai_remedial}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea 
              rows="2"
              className="w-full border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={formData.catatan}
              onChange={e => setData('catatan', e.target.value)}
            ></textarea>
            {errors.catatan && <p className="mt-1 text-xs text-red-500">{errors.catatan}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70">
              {processing ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  MAIN COMPONENT                                                            */
/* ========================================================================== */
export default function PageRemedialPengayaan({ filters, options, kpi, items }) {
  const [f, setF] = useState({
    id_tahun_ajaran: filters?.id_tahun_ajaran || "",
    semester: filters?.semester || "",
    id_kelas: filters?.id_kelas || "",
    id_mapel: filters?.id_mapel || "",
  });
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState({ show: false, data: null, type: null });

  const onApplyFilter = (e) => {
    e?.preventDefault?.();
    router.get(route("admin.remedial.index"), f, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const onResetFilter = () => {
    router.get(route("admin.remedial.index"), {
      id_tahun_ajaran: filters?.id_tahun_ajaran || "",
      semester: filters?.semester || "",
    });
  };

  const filteredItems = items.data.filter(i => 
    i.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Head title="Remedial & Pengayaan" />
      
      <RemedialModal 
        show={modal.show} 
        onClose={() => setModal({ show: false, data: null, type: null })} 
        data={modal.data} 
        type={modal.type} 
      />

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Remedial & Pengayaan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola siswa yang belum mencapai KKM (Remedial) dan pantau capaian (Pengayaan).
          </p>
        </div>
      </div>

      {/* 2. FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={onApplyFilter} className="flex flex-wrap items-end gap-4">
          <FilterSelect label="Tahun Ajaran" value={f.id_tahun_ajaran} onChange={(v) => setF({...f, id_tahun_ajaran: v})} options={options.tahunAjaran} />
          <FilterSelect label="Semester" value={f.semester} onChange={(v) => setF({...f, semester: v})} options={options.semester} />
          <FilterSelect label="Kelas" value={f.id_kelas} onChange={(v) => setF({...f, id_kelas: v})} options={options.kelas} />
          <FilterSelect label="Mata Pelajaran" value={f.id_mapel} onChange={(v) => setF({...f, id_mapel: v})} options={options.mapel} />
          <div className="flex items-center gap-2 pb-0.5">
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <FunnelIcon className="w-4 h-4" />
              Filter
            </button>
            <button type="button" onClick={onResetFilter} className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* 3. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<UserGroupIcon className="w-6 h-6" />}
          iconColor="text-red-500"
          iconBg="bg-red-100"
          label="Belum Remedial"
          value={kpi.belum_remedial}
          subtext="Di bawah KKM"
        />
        <KPICard
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
          iconColor="text-yellow-500"
          iconBg="bg-yellow-100"
          label="Proses Remedial"
          value={kpi.proses_remedial}
          subtext="Menunggu jadwal/nilai"
        />
        <KPICard
          icon={<CheckCircleIcon className="w-6 h-6" />}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-100"
          label="Selesai Remedial"
          value={kpi.selesai_remedial}
          subtext="Telah diremedial"
        />
        <KPICard
          icon={<UserIcon className="w-6 h-6" />}
          iconColor="text-gray-500"
          iconBg="bg-gray-100"
          label="Pengayaan (Tuntas)"
          value={kpi.pengayaan}
          subtext="Siswa tuntas murni"
        />
      </div>

      {/* 4. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Table) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            
            {/* Table Header */}
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-gray-800 text-lg">Daftar Siswa Remedial</h3>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari nama siswa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-gray-300 rounded-lg text-sm py-2 px-3 pl-9 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                  <tr>
                    <th className="px-5 py-4 w-12 text-center">No</th>
                    <th className="px-5 py-4">Nama Siswa</th>
                    <th className="px-5 py-4">Kelas</th>
                    <th className="px-5 py-4">Mapel</th>
                    <th className="px-5 py-4 text-center">Nilai Awal</th>
                    <th className="px-5 py-4 text-center">KKM</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center">Jadwal Remedial</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.length > 0 ? filteredItems.map((row, idx) => (
                    <tr key={row.id_penilaian} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-center text-gray-500">{idx + 1}</td>
                      <td className="px-5 py-4 font-medium text-gray-800">{row.nama}</td>
                      <td className="px-5 py-4 text-gray-600">{row.kelas}</td>
                      <td className="px-5 py-4 text-gray-600">{row.mapel}</td>
                      <td className="px-5 py-4 text-center font-medium text-red-500">{row.nilai_awal_rem || row.nilai_akhir}</td>
                      <td className="px-5 py-4 text-center text-gray-800">{row.kkm}</td>
                      <td className="px-5 py-4 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-4 text-center text-gray-600">{row.jadwal}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3 text-blue-600">
                          <button 
                            onClick={() => setModal({ show: true, data: row, type: 'jadwal' })}
                            className="hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                            title="Jadwalkan Remedial"
                          >
                            <CalendarDaysIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setModal({ show: true, data: row, type: 'nilai' })}
                            className="hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                            title="Input Nilai Remedial"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-gray-500">Tidak ada siswa yang perlu diremedial berdasarkan filter aktif.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Callout */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800 leading-relaxed">
              Remedial dilakukan untuk siswa yang belum mencapai KKM. Setelah nilai remedial dimasukkan, sistem akan otomatis menghitung ulang nilai akhir dan mengubah status menjadi "Selesai Remedial".
            </p>
          </div>
        </div>

        {/* Right Column (Sidebars) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-5">Jadwal Remedial Terdekat</h3>
            <div className="space-y-4">
              {items.data.filter(i => i.status === 'Proses Remedial' && i.jadwal_raw).slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
                    <CalendarDaysIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{item.nama}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.mapel} - {item.kelas}</p>
                    <p className="text-[10px] font-medium text-blue-600 mt-1">{item.jadwal}</p>
                  </div>
                </div>
              ))}
              {items.data.filter(i => i.status === 'Proses Remedial' && i.jadwal_raw).length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">Belum ada jadwal terdekat.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PageRemedialPengayaan.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Remedial & Pengayaan">
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
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 shadow-sm"
        >
          <option value="">Semua {label}</option>
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

function KPICard({ icon, iconColor, iconBg, label, value, subtext }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-[11px] text-gray-500 mt-1">{subtext}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let bg = "";
  let text = "";
  
  if (status === "Belum Remedial") {
    bg = "bg-red-50 border border-red-100";
    text = "text-red-600";
  } else if (status === "Proses Remedial") {
    bg = "bg-amber-50 border border-amber-100";
    text = "text-amber-600";
  } else if (status === "Selesai Remedial") {
    bg = "bg-emerald-50 border border-emerald-100";
    text = "text-emerald-600";
  }

  return (
    <span className={`inline-flex px-2.5 py-1 rounded text-[11px] font-semibold ${bg} ${text}`}>
      {status}
    </span>
  );
}
