import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  BookOpen,
  ArrowLeft,
  X,
  Loader2,
  MessageSquare
} from 'lucide-react';

const statusColor = (status) => {
  switch (status) {
    case 'Diajukan': return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'Disetujui': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'Ditolak': return 'border-rose-200 bg-rose-50 text-rose-700';
    default: return 'border-slate-200 bg-slate-50 text-slate-700';
  }
};

const statusIcon = (status) => {
  switch (status) {
    case 'Diajukan': return <Clock className="h-4 w-4" />;
    case 'Disetujui': return <CheckCircle2 className="h-4 w-4" />;
    case 'Ditolak': return <XCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function formatDateTime(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function AksesEdit({ pengajuan, jadwalOptions }) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    id_jadwal: '',
    tanggal_absensi: '',
    alasan: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('guru.akses-edit-absensi.store'), {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  const openModal = () => {
    clearErrors();
    reset();
    setModalOpen(true);
  };

  return (
    <GuruLayout header="Akses Edit Absensi">
      <Head title="Akses Edit Absensi" />

      <div className="relative min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href={route('guru.absensi-mapel.index')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Absensi
              </Link>
              <h1 className="mt-2 text-2xl font-black text-slate-900">
                Pengajuan Akses Edit
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Ajukan akses ke admin untuk mengubah absensi mapel yang sudah lewat 24 jam.
              </p>
            </div>

            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              Ajukan Akses
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {pengajuan.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <ShieldCheck className="h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-sm font-black text-slate-900">Belum ada pengajuan</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Riwayat pengajuan akses edit absensi Anda akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pengajuan.map((item) => (
                  <div key={item.id} className="p-5 hover:bg-slate-50/50 transition">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${statusColor(item.status)}`}>
                            {statusIcon(item.status)}
                            {item.status}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Diajukan {formatDate(item.created_at)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                            {item.jadwal?.mata_pelajaran?.nama_mapel} - {item.jadwal?.kelas?.nama_kelas}
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            {formatDate(item.tanggal_absensi)}
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          <span className="font-semibold text-slate-800">Alasan: </span>
                          {item.alasan}
                        </p>

                        {item.status === 'Ditolak' && item.catatan_admin && (
                          <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                            <p><strong>Catatan Admin:</strong> {item.catatan_admin}</p>
                          </div>
                        )}

                        {item.status === 'Disetujui' && item.expired_at && (
                          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <Clock className="h-3.5 w-3.5" />
                            Akses berlaku s/d {formatDateTime(item.expired_at)}
                          </div>
                        )}
                      </div>

                      {item.status === 'Disetujui' && new Date(item.expired_at) > new Date() && (
                        <Link
                          href={route('guru.absensi-mapel.show', { id_jadwal: item.id_jadwal, tanggal: item.tanggal_absensi.slice(0, 10) })}
                          className="shrink-0 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-200 transition"
                        >
                          Buka Absensi
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-black text-slate-900">Ajukan Akses Edit</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Jadwal & Kelas</label>
                  <select
                    value={data.id_jadwal}
                    onChange={(e) => setData('id_jadwal', e.target.value)}
                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Jadwal --</option>
                    {jadwalOptions.map((j) => (
                      <option key={j.id_jadwal} value={j.id_jadwal}>
                        {j.mata_pelajaran?.nama_mapel} - Kelas {j.kelas?.nama_kelas}
                      </option>
                    ))}
                  </select>
                  {errors.id_jadwal && <p className="mt-1 text-xs text-rose-500">{errors.id_jadwal}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Tanggal Absensi</label>
                  <input
                    type="date"
                    value={data.tanggal_absensi}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setData('tanggal_absensi', e.target.value)}
                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.tanggal_absensi && <p className="mt-1 text-xs text-rose-500">{errors.tanggal_absensi}</p>}
                  <p className="mt-1 text-xs text-slate-500">Maksimal 30 hari ke belakang.</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Alasan Perubahan</label>
                  <textarea
                    rows={3}
                    value={data.alasan}
                    onChange={(e) => setData('alasan', e.target.value)}
                    placeholder="Jelaskan mengapa Anda perlu mengedit absensi ini..."
                    className="w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.alasan && <p className="mt-1 text-xs text-rose-500">{errors.alasan}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-70"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
