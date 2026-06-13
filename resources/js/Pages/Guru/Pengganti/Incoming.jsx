import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import toast from 'react-hot-toast';
import {
  Inbox,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  Info,
} from 'lucide-react';

export default function Incoming({ auth, requests }) {
  const handleAccept = (id_pengajuan) => {
    if (confirm('Terima permintaan mengajar ini? Anda akan menjadi guru pengganti untuk jadwal ini.')) {
      router.post(route('guru.pengganti.accept', id_pengajuan), {}, {
        preserveScroll: true,
        onSuccess: () => {/* toast handled by flash */},
        onError: () => toast.error('Gagal menerima pengajuan.'),
      });
    }
  };

  const handleReject = (id_pengajuan) => {
    if (confirm('Tolak permintaan ini? Anda tidak akan menjadi pengganti untuk jadwal ini.')) {
      router.post(route('guru.pengganti.reject', id_pengajuan), {}, {
        preserveScroll: true,
        onSuccess: () => {/* toast handled by flash */},
        onError: () => toast.error('Gagal menolak pengajuan.'),
      });
    }
  };

  return (
    <GuruLayout user={auth?.user} header="Permintaan Guru Pengganti">
      <Head title="Permintaan Guru Pengganti" />

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-200 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
            <Inbox className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-900">Permintaan Masuk</h2>
            <p className="mt-1 text-sm text-slate-500">
              Guru lain meminta Anda untuk menggantikan jadwal mengajar mereka. Terima atau tolak permintaan di bawah.
            </p>
          </div>
          <Link
            href={route('guru.pengganti.riwayat')}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Riwayat Pengajuan Saya
          </Link>
        </div>

        {/* Empty State */}
        {requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <Inbox className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-base font-bold text-slate-700">Tidak ada permintaan</h3>
            <p className="mt-1 text-sm text-slate-500">Anda tidak memiliki permintaan guru pengganti saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((p) => (
              <div
                key={p.id_pengajuan}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Status Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    <AlertCircle className="h-3.5 w-3.5" /> Menunggu Konfirmasi
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(p.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>

                {/* Info Jadwal */}
                <div className="mb-3">
                  <h3 className="font-black text-slate-900">
                    {p.jadwal?.kelas?.nama_kelas} — {p.jadwal?.mapel?.nama_mapel || p.jadwal?.mata_pelajaran?.nama_mapel}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Diminta oleh: <span className="font-bold text-slate-700">{p.guru_peminta?.nama_lengkap}</span>
                  </p>
                </div>

                {/* Detail */}
                <div className="mb-4 space-y-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{p.tanggal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{p.jadwal?.jam_mulai?.substring(0, 5)} – {p.jadwal?.jam_selesai?.substring(0, 5)}</span>
                  </div>
                  {p.jadwal?.ruang && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{p.jadwal.ruang}</span>
                    </div>
                  )}
                </div>

                {/* Keterangan */}
                {p.keterangan && (
                  <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 text-sm">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-800 mb-1">
                      <Info className="h-3.5 w-3.5" /> Pesan:
                    </div>
                    <p className="text-indigo-700">{p.keterangan}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(p.id_pengajuan)}
                    className="flex-1 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                  >
                    <XCircle className="h-4 w-4" /> Tolak
                  </button>
                  <button
                    onClick={() => handleAccept(p.id_pengajuan)}
                    className="flex-1 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Terima
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
