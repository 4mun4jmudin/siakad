import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trash2,
  Calendar,
  Clock,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { label: 'Menunggu',  color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: AlertCircle,   dot: 'bg-amber-400' },
  accepted: { label: 'Diterima',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-400' },
  closed:   { label: 'Ditutup',   color: 'bg-slate-100 text-slate-600 border-slate-200',  icon: XCircle,       dot: 'bg-slate-400' },
};

function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-4 ${colorClass}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-black">{value}</div>
        <div className="text-xs font-semibold opacity-80">{label}</div>
      </div>
    </div>
  );
}

export default function Index({ auth, pengajuan, stats, filters }) {
  const [search, setSearch] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || '');

  const applyFilters = () => {
    router.get(route('admin.pengajuan-guru.index'), {
      search: search || undefined,
      status: statusFilter || undefined,
    }, { preserveScroll: true });
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    router.get(route('admin.pengajuan-guru.index'));
  };

  const handleDelete = (id) => {
    if (confirm('Hapus pengajuan ini? Tindakan tidak bisa dibatalkan.')) {
      router.delete(route('admin.pengajuan-guru.destroy', id), {
        onSuccess: () => toast.success('Pengajuan berhasil dihapus'),
        onError: () => toast.error('Gagal menghapus pengajuan'),
      });
    }
  };

  const handleClose = (id) => {
    if (confirm('Tutup paksa pengajuan ini? Semua target guru akan ditolak.')) {
      router.post(route('admin.pengajuan-guru.close', id), {}, {
        onSuccess: () => toast.success('Pengajuan berhasil ditutup'),
        onError: () => toast.error('Gagal menutup pengajuan'),
      });
    }
  };

  const data = pengajuan?.data || [];
  const meta = pengajuan;

  return (
    <AdminLayout user={auth?.user} header="Monitor Pengajuan Guru Pengganti">
      <Head title="Pengajuan Guru Pengganti" />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Pengajuan Guru Pengganti</h1>
              <p className="text-sm font-medium text-slate-500">Monitor dan kelola seluruh pengajuan pengganti jadwal guru.</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Pengajuan" value={stats.total}    icon={TrendingUp}   colorClass="border-indigo-100 bg-indigo-50 text-indigo-700" />
            <StatCard label="Menunggu"         value={stats.pending}  icon={AlertCircle}  colorClass="border-amber-100 bg-amber-50 text-amber-700" />
            <StatCard label="Diterima"         value={stats.accepted} icon={UserCheck}    colorClass="border-emerald-100 bg-emerald-50 text-emerald-700" />
            <StatCard label="Ditutup"          value={stats.closed}   icon={UserX}        colorClass="border-slate-100 bg-slate-50 text-slate-700" />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Cari guru, mapel, kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="min-h-11 w-full rounded-2xl border border-slate-200 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-11 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="accepted">Diterima</option>
            <option value="closed">Ditutup</option>
          </select>

          <button
            onClick={applyFilters}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700 transition"
          >
            <Search className="h-4 w-4" /> Cari
          </button>

          <button
            onClick={handleReset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-black">Tanggal / ID</th>
                  <th className="px-5 py-4 font-black">Guru Peminta</th>
                  <th className="px-5 py-4 font-black">Mapel & Kelas</th>
                  <th className="px-5 py-4 font-black">Target Guru</th>
                  <th className="px-5 py-4 font-black">Status</th>
                  <th className="px-5 py-4 font-black text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((p) => {
                  const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr key={p.id_pengajuan} className="transition hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{new Date(p.created_at).toLocaleDateString('id-ID')}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{p.tanggal}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">#{p.id_pengajuan}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{p.guru_peminta?.nama_lengkap || '-'}</div>
                        {p.keterangan && (
                          <div className="mt-1 text-xs text-slate-500 max-w-[160px] truncate" title={p.keterangan}>
                            "{p.keterangan}"
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-indigo-700">
                          {p.jadwal?.mapel?.nama_mapel || p.jadwal?.mata_pelajaran?.nama_mapel || '-'}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {p.jadwal?.kelas?.nama_kelas}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {p.jadwal?.jam_mulai?.substring(0, 5)} - {p.jadwal?.jam_selesai?.substring(0, 5)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {p.status === 'accepted' ? (
                          <div className="font-bold text-emerald-700 text-sm">
                            ✓ {p.guru_pengganti?.nama_lengkap || '-'}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {(p.targets || []).slice(0, 3).map((t) => (
                              <div key={t.id_target} className="flex items-center gap-1.5 text-xs">
                                <span className={`h-1.5 w-1.5 rounded-full ${t.status === 'accepted' ? 'bg-emerald-400' : t.status === 'rejected' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                                <span className="text-slate-700 font-medium">{t.guru?.nama_lengkap || '-'}</span>
                              </div>
                            ))}
                            {(p.targets?.length || 0) > 3 && (
                              <div className="text-xs text-slate-400">+{p.targets.length - 3} lainnya</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusCfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={route('admin.pengajuan-guru.show', p.id_pengajuan)}
                            className="inline-flex items-center justify-center rounded-xl bg-indigo-50 p-2 text-indigo-600 transition hover:bg-indigo-100"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {p.status === 'pending' && (
                            <button
                              onClick={() => handleClose(p.id_pengajuan)}
                              className="inline-flex items-center justify-center rounded-xl bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100"
                              title="Tutup Paksa"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(p.id_pengajuan)}
                            className="inline-flex items-center justify-center rounded-xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {data.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">
                      <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                      <p className="font-bold text-slate-600">Tidak ada pengajuan</p>
                      <p className="text-slate-400 mt-1">Belum ada pengajuan guru pengganti yang sesuai filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <div className="text-sm text-slate-500 font-medium">
                Menampilkan {meta.from}–{meta.to} dari {meta.total} data
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
                <span className="text-sm font-bold text-slate-700">
                  {meta.current_page} / {meta.last_page}
                </span>
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
      </div>
    </AdminLayout>
  );
}
