import React, { useState, useMemo } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  UserIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  LockClosedIcon,
  LockOpenIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const toNumber = (v) => {
  if (typeof v === "number") return v;
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim().replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
};

const fix2 = (v) => {
  const n = toNumber(v);
  return Number.isFinite(n) ? n.toFixed(2) : "—";
};

export default function NilaiDetail({ header, details = [], komponenOptions = [] }) {
  
  // Calculate Dynamic Component Statistics
  const rekap = useMemo(() => {
    const by = {};
    for (const d of details) {
      const kId = d.id_komponen || 0;
      const kNama = d.komponen_penilaian?.nama || "-";
      if (!by[kNama]) by[kNama] = { total: 0, count: 0 };
      const n = toNumber(d.nilai);
      if (Number.isFinite(n)) {
        by[kNama].total += n;
        by[kNama].count += 1;
      }
    }
    
    return komponenOptions.map((k) => {
      const item = by[k.nama];
      const avg = item && item.count ? item.total / item.count : null;
      return { 
        id_komponen: k.id_komponen,
        komponen: k.nama, 
        rata: avg, 
        jumlah: item?.count ?? 0 
      };
    });
  }, [details, komponenOptions]);

  // Form for adding a grade detail row
  const { data, setData, post, processing, reset, errors } = useForm({
    id_komponen: komponenOptions?.[0]?.id_komponen || "",
    deskripsi: "",
    tanggal: new Date().toISOString().split('T')[0],
    nilai: "",
    bobot: "",
  });

  const submit = (e) => {
    e.preventDefault();
    if (header.status_kunci) return;
    
    post(route("admin.penilaian.nilai.detail.store", header.id_penilaian), {
      preserveScroll: true,
      onSuccess: () => reset("deskripsi", "nilai", "bobot"),
    });
  };

  const deleteDetail = (idDetail) => {
    if (header.status_kunci) return;
    if (confirm("Apakah Anda yakin ingin menghapus baris penilaian ini?")) {
      router.delete(route("admin.penilaian.nilai.detail.destroy", idDetail), {
        preserveScroll: true,
      });
    }
  };

  const toggleLock = () => {
    router.post(route("admin.penilaian.nilai.toggle-lock", header.id_penilaian), {}, {
      preserveScroll: true,
    });
  };

  const kkmBatas = parseFloat(header?.kkm) || 75;
  const isTuntas = parseFloat(header?.nilai_akhir) >= kkmBatas;

  return (
    <div className="space-y-6">
      <Head title={`Detail Nilai - ${header?.nama_siswa}`} />

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rincian Penilaian Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola pencatatan rincian nilai detail per kompetensi dan kontrol kuncian data.</p>
        </div>
        <Link
          href={route("admin.penilaian.nilai.index")}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors shadow-2xs"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Kembali ke Daftar Nilai
        </Link>
      </div>

      {/* 2. Lock Banner Alert */}
      {header.status_kunci && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 shadow-xs">
          <LockClosedIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-extrabold uppercase tracking-wide block mb-0.5">Penilaian Dikunci</strong>
            Jurnal penilaian untuk siswa ini telah dikunci oleh administrator. Pengisian nilai baru, penyuntingan, atau penghapusan rincian nilai sementara dinonaktifkan.
          </div>
        </div>
      )}

      {/* 3. Student Personal Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-700 shadow-2xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-base">{header?.nama_siswa}</h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">NIS: {header?.nis || "—"}</p>
            </div>
          </div>
          <button
            onClick={toggleLock}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-lg shadow-sm transition-all duration-200 self-stretch sm:self-auto justify-center uppercase tracking-wide ${
              header.status_kunci
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-rose-600 hover:bg-rose-700 text-white"
            }`}
          >
            {header.status_kunci ? (
              <>
                <LockOpenIcon className="w-4 h-4" /> Buka Kunci Jurnal
              </>
            ) : (
              <>
                <LockClosedIcon className="w-4 h-4" /> Kunci Penilaian
              </>
            )}
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          <InfoCard label="Mata Pelajaran" value={header?.nama_mapel} icon={<BookOpenIcon className="w-4 h-4" />} />
          <InfoCard label="Semester / Periode" value={`${header?.semester} (${header?.id_tahun_ajaran})`} icon={<CalendarDaysIcon className="w-4 h-4" />} />
          <InfoCard label="Batas KKM Lulus" value={kkmBatas} icon={<AcademicCapIcon className="w-4 h-4" />} />
          <InfoCard
            label="Nilai Akhir Siswa"
            value={
              <span className={`font-extrabold text-sm ${isTuntas ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded" : "text-rose-600 bg-rose-50 px-2 py-0.5 rounded"}`}>
                {fix2(header?.nilai_akhir)}
              </span>
            }
          />
          <InfoCard
            label="Status Ketuntasan"
            value={
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-2xs border ${
                isTuntas 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {isTuntas ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
                {isTuntas ? "Tuntas KKM" : "Tidak Tuntas"}
              </span>
            }
          />
        </div>
      </div>

      {/* 4. Rekap Komponen Penilaian */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5">
        <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
          <span>📊</span> Rekap Rata-rata per Komponen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rekap.map((r) => {
            const hasAvg = r.rata != null;
            const avgVal = hasAvg ? parseFloat(r.rata) : 0;
            const colors = avgVal >= kkmBatas 
              ? { bar: 'bg-emerald-500', text: 'text-emerald-600 bg-emerald-50' } 
              : { bar: 'bg-amber-500', text: 'text-amber-600 bg-amber-50' };

            return (
              <div key={r.komponen} className="p-4 bg-gray-50/50 rounded-xl border border-gray-150 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2 text-xs">
                  <span className="font-bold text-gray-700">{r.komponen}</span>
                  <span className="text-gray-400 font-medium">{r.jumlah} Entri Nilai</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                    <div 
                      className={`h-full ${colors.bar} rounded-full transition-all duration-500 shadow-xs`}
                      style={{ width: `${hasAvg ? avgVal : 0}%` }}
                    ></div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded font-extrabold text-xs shadow-2xs ${hasAvg ? colors.text : 'text-gray-400 bg-gray-100'}`}>
                    {hasAvg ? avgVal.toFixed(2) : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Detail Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/20">
          <div>
            <h3 className="font-semibold text-gray-800">Baris Rincian Nilai</h3>
            <p className="text-xs text-gray-500 mt-0.5">Daftar entri pelaksanaan ujian/tugas harian siswa.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center">No</th>
                <th className="px-5 py-3.5">Tanggal Pelaksanaan</th>
                <th className="px-5 py-3.5">Komponen</th>
                <th className="px-5 py-3.5">Keterangan / Topik</th>
                <th className="px-5 py-3.5 text-center">Nilai</th>
                <th className="px-5 py-3.5 text-center">Bobot Lokal</th>
                {!header.status_kunci && <th className="px-5 py-3.5 text-center w-24">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {details.length > 0 ? (
                details.map((d, idx) => {
                  const colors = d.nilai >= kkmBatas 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border border-amber-100';

                  return (
                    <tr className="hover:bg-gray-50 transition-colors" key={d.id_detail}>
                      <td className="px-5 py-3.5 text-center font-medium text-gray-500">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-600">{d.tanggal ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase">
                          {d.komponen_penilaian?.nama ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs italic">{d.deskripsi ?? "—"}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded shadow-3xs ${colors}`}>
                          {fix2(d.nilai)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-gray-600 font-semibold text-xs">
                        {d.bobot == null || d.bobot === "" ? "—" : `${fix2(d.bobot)}%`}
                      </td>
                      {!header.status_kunci && (
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => deleteDetail(d.id_detail)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hapus Nilai"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="p-8 text-center text-gray-400 bg-gray-50/50" colSpan={header.status_kunci ? 6 : 7}>
                    Belum ada rincian nilai terdaftar untuk siswa ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Form Input */}
      {!header.status_kunci && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-800 text-sm">Tambah Rincian Nilai Baru</h3>
          </div>
          <form onSubmit={submit} className="p-5 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Komponen</label>
              <select
                value={data.id_komponen}
                onChange={(e) => setData("id_komponen", e.target.value)}
                className="w-full border-gray-300 rounded-lg text-xs py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-gray-700"
              >
                {komponenOptions.map((k) => (
                  <option key={k.id_komponen} value={k.id_komponen}>{k.nama}</option>
                ))}
              </select>
              {errors.id_komponen && <div className="text-[10px] text-red-500 font-semibold">{errors.id_komponen}</div>}
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tanggal</label>
              <input
                type="date"
                value={data.tanggal || ""}
                onChange={(e) => setData("tanggal", e.target.value)}
                required
                className="w-full border-gray-300 rounded-lg text-xs py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-gray-700"
              />
              {errors.tanggal && <div className="text-[10px] text-red-500 font-semibold">{errors.tanggal}</div>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Keterangan / Topik</label>
              <input
                type="text"
                placeholder="Misal: Ulangan Harian Bab 1"
                value={data.deskripsi}
                onChange={(e) => setData("deskripsi", e.target.value)}
                className="w-full border-gray-300 rounded-lg text-xs py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-gray-700"
              />
              {errors.deskripsi && <div className="text-[10px] text-red-500 font-semibold">{errors.deskripsi}</div>}
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nilai Angka (0-100)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={data.nilai}
                onChange={(e) => setData("nilai", e.target.value)}
                required
                className="w-full border-gray-300 rounded-lg text-xs py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 font-extrabold text-blue-600"
              />
              {errors.nilai && <div className="text-[10px] text-red-500 font-semibold">{errors.nilai}</div>}
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <button
                type="submit"
                disabled={processing}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 h-[38px] uppercase tracking-wide"
              >
                <PlusIcon className="w-4 h-4" />
                {processing ? "Simpan..." : "Simpan Nilai"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

NilaiDetail.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Detail Rincian Nilai">
    {page}
  </AdminLayout>
);

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl flex items-center gap-3">
      {icon && <div className="text-gray-400 shrink-0">{icon}</div>}
      <div>
        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</span>
        <span className="font-semibold text-gray-700">{value}</span>
      </div>
    </div>
  );
}
