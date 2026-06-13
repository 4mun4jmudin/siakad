import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  UserCheck,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { label: 'Menunggu',  color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
  accepted: { label: 'Diterima',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  closed:   { label: 'Ditutup',   color: 'bg-slate-100 text-slate-600 border-slate-200', icon: XCircle },
};

export default function Riwayat({ auth, pengajuan }) {
  const data = pengajuan?.data || [];
  const meta = pengajuan;

  return (
    <GuruLayout user={auth?.user} header="Riwayat Pengajuan Guru Pengganti">
      <Head title="Riwayat Pengajuan Pengganti" />

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Riwayat Pengajuan Saya</h2>
              <p className="mt-1 text-sm text-slate-500">
                Semua pengajuan guru pengganti yang pernah Anda buat.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={route('guru.pengganti.incoming')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Permintaan Masuk
            </Link>
          </div>
        </div>

        {/* Content */}
        {data.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-base font-bold text-slate-700">Belum ada pengajuan</h3>
            <p className="mt-1 text-sm text-slate-500">
              Anda belum pernah mengajukan permintaan guru pengganti.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((p) => {
              const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              return (
                <div
                  key={p.id_pengajuan}
                  className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusCfg.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusCfg.label}
                        </span>
                        <span className="text-xs text-slate-400">#{p.id_pengajuan}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(p.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900">
                        {p.jadwal?.mapel?.nama_mapel || p.jadwal?.mata_pelajaran?.nama_mapel || 'Mata Pelajaran'} — {p.jadwal?.kelas?.nama_kelas}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {p.tanggal}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {p.jadwal?.jam_mulai?.substring(0, 5)} – {p.jadwal?.jam_selesai?.substring(0, 5)}
                        </span>
                      </div>

                      {p.keterangan && (
                        <p className="mt-2 text-sm text-slate-500 italic">"{p.keterangan}"</p>
                      )}
                    </div>

                    {/* Right — Guru Pengganti */}
                    <div className="min-w-[160px] text-right">
                      {p.status === 'accepted' && p.guru_pengganti ? (
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-right">
                          <div className="flex items-center justify-end gap-1.5 text-emerald-700 font-bold mb-0.5">
                            <UserCheck className="h-3.5 w-3.5" /> Pengganti:
                          </div>
                          <div className="font-black text-emerald-900 text-sm">{p.guru_pengganti.nama_lengkap}</div>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm">
                          <div className="text-xs text-slate-400 font-semibold mb-1">Target Guru ({p.targets?.length || 0})</div>
                          {(p.targets || []).slice(0, 3).map((t) => (
                            <div key={t.id_target} className="flex items-center justify-end gap-1.5 text-xs text-slate-600 mt-0.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${t.status === 'accepted' ? 'bg-emerald-400' : t.status === 'rejected' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                              {t.guru?.nama_lengkap}
                            </div>
                          ))}
                          {(p.targets?.length || 0) > 3 && (
                            <div className="text-xs text-slate-400 mt-0.5">+{p.targets.length - 3} lainnya</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 font-medium">
              Halaman {meta.current_page} dari {meta.last_page}
            </div>
            <div className="flex items-center gap-2">
              {meta.prev_page_url && (
                <Link
                  href={meta.prev_page_url}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
              {meta.next_page_url && (
                <Link
                  href={meta.next_page_url}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
