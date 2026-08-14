import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft,
  UserCheck,
  Trash2,
  UserPlus,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { label: 'Menunggu',  color: 'bg-amber-50 text-amber-700',   icon: AlertCircle },
  accepted: { label: 'Diterima',  color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  closed:   { label: 'Ditutup',   color: 'bg-slate-100 text-slate-600',   icon: XCircle },
};

const TARGET_STATUS = {
  pending:  { label: 'Menunggu',  color: 'bg-amber-50 text-amber-700' },
  accepted: { label: 'Diterima',  color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Ditolak',   color: 'bg-rose-50 text-rose-700' },
};

export default function Show({ auth, pengajuan }) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { data, setData, post, processing } = useForm({ id_guru_pengganti: '' });

  const statusCfg = STATUS_CONFIG[pengajuan.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const handleClose = () => {
    if (confirm('Tutup paksa pengajuan ini? Semua target guru akan ditolak.')) {
      router.post(route('admin.pengajuan-guru.close', pengajuan.id_pengajuan), {}, {
        onSuccess: () => toast.success('Pengajuan berhasil ditutup'),
        onError: () => toast.error('Gagal menutup pengajuan'),
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Hapus pengajuan ini? Tindakan tidak bisa dibatalkan.')) {
      router.delete(route('admin.pengajuan-guru.destroy', pengajuan.id_pengajuan), {
        onSuccess: () => {
          toast.success('Pengajuan berhasil dihapus');
        },
        onError: () => toast.error('Gagal menghapus'),
      });
    }
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!data.id_guru_pengganti) {
      toast.error('Pilih guru terlebih dahulu.');
      return;
    }
    post(route('admin.pengajuan-guru.assign', pengajuan.id_pengajuan), {
      onSuccess: () => {
        toast.success('Guru pengganti berhasil ditugaskan!');
        setShowAssignModal(false);
      },
      onError: () => toast.error('Gagal menugaskan guru.'),
    });
  };

  // Kumpulkan semua guru dari targets untuk assign modal (kecuali yang sudah ditugaskan)
  const targetGurus = pengajuan.targets || [];

  return (
    <AdminLayout user={auth?.user} header="Detail Pengajuan Guru Pengganti">
      <Head title={`Detail Pengajuan #${pengajuan.id_pengajuan}`} />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Back */}
        <Link
          href={route('admin.pengajuan-guru.index')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali ke Daftar
        </Link>

        {/* Header Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${statusCfg.color}`}>
                  <StatusIcon className="h-4 w-4" />
                  {statusCfg.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">#{pengajuan.id_pengajuan}</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">
                {pengajuan.jadwal?.mapel?.nama_mapel || pengajuan.jadwal?.mata_pelajaran?.nama_mapel || 'Pengajuan Pengganti'}
              </h1>
              <p className="mt-1 text-slate-500 font-medium">
                {pengajuan.jadwal?.kelas?.nama_kelas}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {pengajuan.status === 'pending' && (
                <>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition"
                  >
                    <UserPlus className="h-4 w-4" /> Tugaskan Guru
                  </button>
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-100 transition"
                  >
                    <XCircle className="h-4 w-4" /> Tutup Paksa
                  </button>
                </>
              )}
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100 transition"
              >
                <Trash2 className="h-4 w-4" /> Hapus
              </button>
            </div>
          </div>

          {/* Detail Jadwal */}
          <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <div className="text-[11px] text-slate-400 font-semibold">Tanggal Penggantian</div>
                <div className="font-bold text-slate-800">{pengajuan.tanggal}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <div className="text-[11px] text-slate-400 font-semibold">Jam Pelajaran</div>
                <div className="font-bold text-slate-800">
                  {pengajuan.jadwal?.jam_mulai?.substring(0, 5)} – {pengajuan.jadwal?.jam_selesai?.substring(0, 5)}
                </div>
              </div>
            </div>
            {pengajuan.jadwal?.ruang && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold">Ruang</div>
                  <div className="font-bold text-slate-800">{pengajuan.jadwal.ruang}</div>
                </div>
              </div>
            )}
          </div>

          {/* Keterangan */}
          {pengajuan.keterangan && (
            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-800 mb-1">
                <Info className="h-4 w-4" /> Pesan dari Guru Peminta
              </div>
              <p className="text-sm text-indigo-700">{pengajuan.keterangan}</p>
            </div>
          )}
        </div>

        {/* Guru Peminta */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-black text-slate-900">Guru Peminta</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 font-black text-lg">
              {(pengajuan.guru_peminta?.nama_lengkap || 'G')[0].toUpperCase()}
            </div>
            <div>
              <div className="font-black text-slate-900">{pengajuan.guru_peminta?.nama_lengkap || '-'}</div>
              <div className="text-sm text-slate-500">{pengajuan.guru_peminta?.nip || 'NIP -'}</div>
            </div>
          </div>
        </div>

        {/* Guru Pengganti (jika sudah ada) */}
        {pengajuan.guru_pengganti && (
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm">
            <h2 className="mb-4 text-base font-black text-emerald-800">Guru Pengganti Terpilih</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-200 text-emerald-800 font-black text-lg">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="font-black text-emerald-900">{pengajuan.guru_pengganti.nama_lengkap}</div>
                <div className="text-sm text-emerald-700">{pengajuan.guru_pengganti.nip || 'NIP -'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Daftar Target Guru */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-black text-slate-900">Daftar Target Guru</h2>

          {targetGurus.length === 0 ? (
            <p className="text-sm text-slate-400">Tidak ada target guru yang ditetapkan.</p>
          ) : (
            <div className="space-y-3">
              {targetGurus.map((t) => {
                const tsCfg = TARGET_STATUS[t.status] || TARGET_STATUS.pending;
                return (
                  <div key={t.id_target} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 font-black shadow-sm">
                        {(t.guru?.nama_lengkap || 'G')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{t.guru?.nama_lengkap || '-'}</div>
                        <div className="text-xs text-slate-500">{t.guru?.nip || 'NIP -'}</div>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tsCfg.color}`}>
                      {tsCfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-2">Tugaskan Guru Pengganti</h3>
            <p className="text-sm text-slate-500 mb-5">
              Pilih guru yang akan langsung ditugaskan sebagai pengganti. Semua target yang lain akan ditolak secara otomatis.
            </p>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Pilih Guru</label>
                <select
                  value={data.id_guru_pengganti}
                  onChange={(e) => setData('id_guru_pengganti', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  required
                >
                  <option value="">-- Pilih Guru --</option>
                  {targetGurus.map((t) => (
                    <option key={t.id_target} value={t.guru?.id_guru}>
                      {t.guru?.nama_lengkap} ({t.guru?.nip || 'NIP -'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 rounded-2xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {processing ? 'Memproses...' : 'Tugaskan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
