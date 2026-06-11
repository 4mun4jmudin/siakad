import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  UsersIcon,
  AcademicCapIcon,
  LockClosedIcon,
  CheckBadgeIcon,
  FunnelIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";

function NilaiIndex({ options = {}, list = [] }) {
  const [f, setF] = useState({
    id_tahun_ajaran: "",
    semester: "",
    id_kelas: "",
    id_mapel: "",
  });

  const apply = (e) => {
    e?.preventDefault?.();
    router.get(route("admin.penilaian.nilai.index"), f, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  // Dynamic KPI Calculations from the list
  const kpis = useMemo(() => {
    const total = list.length;
    if (total === 0) {
      return { total: 0, avg: 0, tuntasPct: 0, locked: 0 };
    }

    let sum = 0;
    let tuntasCount = 0;
    let lockedCount = 0;

    list.forEach((r) => {
      sum += parseFloat(r.nilai_akhir) || 0;
      if (r.tuntas == 1 || r.tuntas === true) {
        tuntasCount++;
      }
      if (r.status_kunci == 1 || r.status_kunci === true) {
        lockedCount++;
      }
    });

    return {
      total,
      avg: parseFloat((sum / total).toFixed(2)),
      tuntasPct: parseFloat(((tuntasCount / total) * 100).toFixed(1)),
      locked: lockedCount,
    };
  }, [list]);

  return (
    <div className="space-y-6">
      <Head title="Kelola Nilai Kelas/Mapel" />

      {/* 1. Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Nilai Akademik</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar nilai akhir siswa per mata pelajaran, rekapitulasi ketuntasan KKM, dan status kuncian nilai jurnal.
        </p>
      </div>

      {/* 2. KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<UsersIcon className="w-6 h-6" />}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          label="Total Entri Siswa"
          value={`${kpis.total} Siswa`}
          subtext="Jumlah siswa dalam filter aktif"
        />
        <KPICard
          icon={<AcademicCapIcon className="w-6 h-6" />}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
          label="Rata-rata Nilai"
          value={kpis.avg}
          subtext="Skala Penilaian 0-100"
          valueColor={kpis.avg >= 75 ? "text-emerald-600" : "text-amber-500"}
        />
        <KPICard
          icon={<CheckBadgeIcon className="w-6 h-6" />}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
          label="Tingkat Kelulusan"
          value={`${kpis.tuntasPct}%`}
          subtext="Siswa tuntas KKM mapel"
          valueColor={kpis.tuntasPct >= 75 ? "text-emerald-600" : "text-amber-500"}
        />
        <KPICard
          icon={<LockClosedIcon className="w-6 h-6" />}
          iconColor="text-rose-600"
          iconBg="bg-rose-100"
          label="Nilai Dikunci"
          value={`${kpis.locked} / ${kpis.total}`}
          subtext="Mengunci jurnal penilaian"
          valueColor={kpis.locked > 0 ? "text-rose-600" : "text-gray-800"}
        />
      </div>

      {/* 3. Sleek Filter Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
          <FunnelIcon className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-800 text-sm">Filter Kelas & Mata Pelajaran</h3>
        </div>
        <div className="p-5">
          <form onSubmit={apply} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <Select
              icon={<CalendarDaysIcon className="w-4 h-4 text-gray-400" />}
              label="Tahun Ajaran"
              value={f.id_tahun_ajaran}
              onChange={(v) => setF((s) => ({ ...s, id_tahun_ajaran: v }))}
              options={(options.ta || []).map((t) => ({
                value: t.value ?? t.id_tahun_ajaran,
                label: t.label ?? t.tahun_ajaran,
              }))}
            />
            <Select
              icon={<BookOpenIcon className="w-4 h-4 text-gray-400" />}
              label="Semester"
              value={f.semester}
              onChange={(v) => setF((s) => ({ ...s, semester: v }))}
              options={options.semester || []}
            />
            <Select
              icon={<UsersIcon className="w-4 h-4 text-gray-400" />}
              label="Kelas"
              value={f.id_kelas}
              onChange={(v) => setF((s) => ({ ...s, id_kelas: v }))}
              options={(options.kelas || []).map((k) => ({
                value: k.value ?? k.id_kelas,
                label: k.label ?? k.id_kelas,
              }))}
            />
            <Select
              icon={<AcademicCapIcon className="w-4 h-4 text-gray-400" />}
              label="Mata Pelajaran"
              value={f.id_mapel}
              onChange={(v) => setF((s) => ({ ...s, id_mapel: v }))}
              options={(options.mapel || []).map((m) => ({
                value: m.value ?? m.id_mapel,
                label: m.label ?? m.nama_mapel,
              }))}
            />
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Terapkan Filter
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!f.id_tahun_ajaran || !f.semester || !f.id_kelas || !f.id_mapel) {
                    alert('Harap lengkapi semua filter (Tahun Ajaran, Semester, Kelas, Mapel) sebelum men-generate data penilaian.');
                    return;
                  }
                  if (confirm('Apakah Anda yakin ingin men-generate / menambahkan header penilaian massal untuk kelas ini?')) {
                    router.post(route('admin.penilaian.nilai.generate'), f, { preserveScroll: true, preserveState: true });
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Buat Penilaian
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. Table List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/20">
          <div>
            <h3 className="font-semibold text-gray-800">Daftar Nilai Siswa</h3>
            <p className="text-xs text-gray-500 mt-0.5">Menampilkan seluruh data berdasarkan filter yang diterapkan.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center">No</th>
                <th className="px-5 py-3.5">NIS / Nama Siswa</th>
                <th className="px-5 py-3.5">Mata Pelajaran</th>
                <th className="px-5 py-3.5 text-center">Nilai Akhir</th>
                <th className="px-5 py-3.5 text-center">Predikat</th>
                <th className="px-5 py-3.5 text-center">Ketuntasan</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.length > 0 ? (
                list.map((r, idx) => (
                  <tr className="hover:bg-gray-50 transition-colors" key={r.id_penilaian}>
                    <td className="px-5 py-4 text-center font-medium text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800">{r.nama_siswa || r.id_siswa}</div>
                      <div className="text-xs text-gray-400 mt-0.5">NIS: {r.nis || "—"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-700">{r.nama_mapel || r.id_mapel}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold mt-0.5">{r.id_kelas} • {r.semester}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-sm font-extrabold px-3 py-1 rounded-lg shadow-2xs ${r.nilai_akhir >= 75 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        {fmt2(r.nilai_akhir)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6 rounded-md font-extrabold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                        {r.predikat || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.tuntas == 1 || r.tuntas === true
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      } border`}>
                        {r.tuntas ? "Tuntas" : "Tidak Tuntas"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {r.status_kunci ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded uppercase">
                          <LockClosedIcon className="w-3 h-3 text-rose-500" /> Dikunci
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded uppercase">
                          <LockOpenIcon className="w-3 h-3 text-emerald-500" /> Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center">
                        <Link
                          href={route("admin.penilaian.nilai.detail.show", r.id_penilaian)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-650 hover:text-white transition-all shadow-2xs"
                        >
                          Rincian Nilai
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-8 text-center text-gray-500 font-medium" colSpan={8}>
                    Belum ada data penilaian kelas/mapel. Gunakan filter di atas untuk menampilkan data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

NilaiIndex.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Kelola Nilai">
    {page}
  </AdminLayout>
);

export default NilaiIndex;

/* ========================================================================== */
/*  Helper Subcomponents                                                      */
/* ========================================================================== */

function KPICard({ icon, iconColor, iconBg, label, value, subtext, valueColor }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4 relative overflow-hidden">
      <div className={`p-3.5 rounded-xl ${iconBg} ${iconColor} shadow-2xs`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-xl font-extrabold ${valueColor || 'text-gray-800'}`}>{value}</p>
        {subtext && <p className="text-[10px] text-gray-400 mt-1 font-medium">{subtext}</p>}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options = [], icon }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</label>
      <div className="relative rounded-md shadow-2xs">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className={`w-full border border-gray-300 rounded-lg text-xs py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-semibold ${icon ? 'pl-9' : ''}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value || "")}
        >
          <option value="">— Semua {label} —</option>
          {(options || []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function fmt2(n) {
  return n == null ? "—" : parseFloat(Number(n).toFixed(2));
}
