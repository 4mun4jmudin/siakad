import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  CalendarDays,
  User,
  MessageSquare,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import Pagination from '@/Components/Pagination';

const statusTone = (status) => {
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
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function formatDateTime(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function Index({ auth, pengajuan }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, catatan: '' });
  const prevDataRef = useRef(pengajuan?.data || []);

  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({
        only: ['pengajuan'],
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
          const newData = page.props.pengajuan?.data || [];
          const oldData = prevDataRef.current;
          
          // Detect new incoming requests
          const newItems = newData.filter(n => !oldData.some(o => o.id === n.id));
          if (newItems.length > 0) {
            toast.success(`Terdapat ${newItems.length} pengajuan akses edit baru!`, {
              icon: '🔔',
              style: { borderRadius: '1rem', background: '#334155', color: '#fff' }
            });
          }
          
          prevDataRef.current = newData;
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleApprove = (id) => {
    if (confirm('Setujui pengajuan ini? Guru akan mendapatkan akses edit absensi selama 24 jam.')) {
      router.post(route('admin.akses-edit-absensi.approve', id));
    }
  };

  const handleReject = (e) => {
    e.preventDefault();
    router.post(route('admin.akses-edit-absensi.reject', rejectModal.id), {
      catatan_admin: rejectModal.catatan
    }, {
      onSuccess: () => setRejectModal({ open: false, id: null, catatan: '' })
    });
  };

  return (
    <AdminLayout
      user={auth?.user}
      header="Kelola Pengajuan Akses Edit Absensi"
      roles={auth?.roles}
    >
      <Head title="Kelola Akses Edit Absensi" />

      <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Pengajuan Akses Edit
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Kelola permohonan akses edit absensi dari guru.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {(!pengajuan?.data || pengajuan.data.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <ShieldCheck className="h-16 w-16 text-slate-200" />
                <h3 className="mt-4 text-base font-black text-slate-900">Belum ada pengajuan</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Semua pengajuan akses edit dari guru akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pengajuan.data.map((item) => (
                  <div key={item.id} className="p-5 hover:bg-slate-50/50 transition">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusTone(item.status)}`}>
                            {statusIcon(item.status)}
                            {item.status}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Diajukan {formatDateTime(item.created_at)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <User className="h-4 w-4 text-slate-400" />
                            {item.guru?.nama_lengkap}
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                            {item.jadwal?.mata_pelajaran?.nama_mapel} - {item.jadwal?.kelas?.nama_kelas}
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            {formatDate(item.tanggal_absensi)}
                          </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                          <span className="font-semibold text-slate-800">Alasan: </span>
                          {item.alasan}
                        </div>

                        {item.catatan_admin && (
                          <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                            <span className="font-semibold">Catatan Admin: </span>
                            {item.catatan_admin}
                          </div>
                        )}

                        {item.status === 'Disetujui' && item.expired_at && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <Clock className="h-3.5 w-3.5" />
                            Akses berlaku s/d {formatDateTime(item.expired_at)}
                          </div>
                        )}
                      </div>

                      {item.status === 'Diajukan' && (
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => setRejectModal({ open: true, id: item.id, catatan: '' })}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                          >
                            <X className="h-4 w-4" />
                            Tolak
                          </button>
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                          >
                            <Check className="h-4 w-4" />
                            Setujui
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {pengajuan.links && pengajuan.links.length > 3 && (
              <div className="border-t border-slate-100 p-4">
                <Pagination links={pengajuan.links} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setRejectModal({ open: false, id: null, catatan: '' })} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-black text-slate-900">Tolak Pengajuan</h3>
              <p className="text-sm text-slate-500">Berikan catatan penolakan kepada guru.</p>
            </div>

            <form onSubmit={handleReject} className="p-6">
              <textarea
                autoFocus
                rows={3}
                value={rejectModal.catatan}
                onChange={(e) => setRejectModal({ ...rejectModal, catatan: e.target.value })}
                placeholder="Contoh: Silakan hubungi admin secara langsung..."
                className="w-full rounded-xl border-slate-200 text-sm focus:border-rose-500 focus:ring-rose-500"
                required
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, id: null, catatan: '' })}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 transition shadow-sm"
                >
                  Tolak Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
