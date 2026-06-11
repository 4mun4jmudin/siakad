// resources/js/Pages/OrangTua/SuratIzin/Index.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import {
  FileUp,
  Filter,
  Clock,
  Eye,
  X,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Ban,
  Loader2,
  ExternalLink,
  Sparkles,
  Send,
  ClipboardList,
  Inbox,
  HeartPulse,
  FileCheck2,
  RefreshCw,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function routeExists(name) {
  return !!window?.Ziggy?.routes?.[name];
}

function safeRoute(name, params = {}, fallback = '#') {
  try {
    return window.route(name, params);
  } catch {
    return fallback;
  }
}

function formatBytes(bytes = 0) {
  if (!bytes) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function isProbablyPdf(url = '') {
  const value = String(url).toLowerCase();
  return value.includes('.pdf') || value.includes('application/pdf');
}

function formatDate(date) {
  if (!date) return '-';

  try {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

const statusTheme = {
  Diajukan: {
    soft: 'bg-amber-50 text-amber-700 border-amber-200',
    solid: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
    icon: Clock,
    label: 'Menunggu',
  },
  Disetujui: {
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    solid: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white',
    icon: ShieldCheck,
    label: 'Disetujui',
  },
  Ditolak: {
    soft: 'bg-rose-50 text-rose-700 border-rose-200',
    solid: 'bg-gradient-to-br from-rose-500 to-pink-500 text-white',
    icon: ShieldX,
    label: 'Ditolak',
  },
};

function PremiumCard({ children, className = '', delay = 0 }) {
  return (
    <div
      className={classNames(
        'animate-soft-rise rounded-3xl border border-white/70 bg-white/85',
        'shadow-[0_20px_55px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-35px_rgba(15,23,42,0.55)]',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Badge({ status }) {
  const current = statusTheme[status] || {
    soft: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: AlertTriangle,
  };

  const Icon = current.icon;

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-[11px] font-black uppercase tracking-wide shadow-sm',
        current.soft
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function PillLink({ href, active, children }) {
  return (
    <Link
      href={href}
      preserveScroll
      className={classNames(
        'inline-flex min-h-10 items-center gap-2 rounded-2xl border px-3.5 py-2',
        'text-xs font-black transition-all duration-300',
        active
          ? 'border-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
          : 'border-slate-200 bg-white/80 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
      )}
    >
      {children}
    </Link>
  );
}

function Modal({ open, onClose, title, subtitle, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
        <div className="animate-modal-pop w-full max-w-3xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
          <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 px-4 py-4 text-white sm:px-5">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base font-black leading-tight break-words">
                  {title}
                </div>

                {subtitle && (
                  <div className="mt-1 text-xs font-medium leading-relaxed text-white/75 break-words">
                    {subtitle}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[75vh] overflow-auto p-4 custom-scrollbar sm:p-5">
            {children}
          </div>

          {footer && (
            <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AttachmentViewer({ row }) {
  const url = row?.view_url || row?.preview_url || row?.download_url || null;

  if (!url) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <Paperclip className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm font-bold text-slate-500">
          Tidak ada lampiran.
        </p>
      </div>
    );
  }

  if (isProbablyPdf(url)) {
    return (
      <iframe
        title="Preview PDF"
        src={url}
        className="h-[70vh] w-full rounded-3xl border border-slate-200 bg-white shadow-sm"
      />
    );
  }

  return (
    <img
      src={url}
      alt="Lampiran"
      className="w-full rounded-3xl border border-slate-200 bg-white shadow-sm"
    />
  );
}

function Dropzone({
  value,
  onChange,
  error,
  hint = 'PDF/JPG/PNG maks 2MB',
  accept = '.pdf,.jpg,.jpeg,.png',
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const file = value ?? null;

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const isImage = file.type?.startsWith('image/');

    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      return () => URL.revokeObjectURL(url);
    }

    setPreviewUrl(null);
  }, [file]);

  const pick = () => inputRef.current?.click();

  const clear = () => {
    onChange(null);
    setPreviewOpen(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const droppedFile = event.dataTransfer?.files?.[0];

    if (droppedFile) {
      onChange(droppedFile);
    }
  };

  const canPreview =
    !!file &&
    (previewUrl || file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf'));

  return (
    <>
      <div
        onClick={pick}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        className={classNames(
          'group relative cursor-pointer rounded-3xl border-2 border-dashed p-4 transition-all duration-300',
          dragActive
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-slate-200 bg-slate-50/70 hover:border-emerald-200 hover:bg-emerald-50/40',
          error ? 'border-rose-300 bg-rose-50/50' : ''
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />

        {!file ? (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200">
              <FileUp className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-slate-900">
                Upload lampiran
              </div>

              <div className="mt-0.5 text-xs font-medium leading-relaxed text-slate-600">
                Drag & drop di sini, atau{' '}
                <span className="font-black text-emerald-700">
                  klik untuk pilih file
                </span>.
              </div>

              <div className="mt-2 text-[11px] font-semibold text-slate-400">
                {hint}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div
              className={classNames(
                'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg',
                previewUrl
                  ? 'bg-gradient-to-br from-sky-500 to-cyan-500 shadow-sky-200'
                  : 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-200'
              )}
            >
              {previewUrl ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-slate-900">
                    {file.name}
                  </div>

                  <div className="mt-0.5 text-xs font-semibold text-slate-500">
                    {file.type || 'file'} • {formatBytes(file.size)}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {canPreview && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPreviewOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                      Lihat
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      clear();
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-black text-rose-600 ring-1 ring-slate-200 transition hover:bg-rose-50"
                    title="Hapus file"
                  >
                    <X className="h-4 w-4" />
                    Hapus
                  </button>
                </div>
              </div>

              {previewUrl && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={file?.name || 'Lampiran'}
        subtitle="Preview lampiran sebelum dikirim"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full rounded-3xl border border-slate-200"
          />
        ) : (
          <div className="space-y-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              File ini bukan gambar. Preview langsung kadang terbatas, tapi file tetap akan ikut terkirim.
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-black text-slate-900">
                {file?.name}
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-600">
                {file?.type || 'file'} • {formatBytes(file?.size || 0)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
        <Inbox className="h-7 w-7" />
      </div>

      <div className="mt-4 text-sm font-black text-slate-700">
        Belum ada pengajuan
      </div>

      <div className="mt-1 text-sm leading-relaxed text-slate-500">
        Buat pengajuan izin atau sakit untuk melihat riwayat di sini.
      </div>
    </div>
  );
}

function StatMiniCard({ label, value, icon: Icon, className }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
      <Icon className="mx-auto h-5 w-5 text-white/90" />

      <p className="mt-2 text-2xl font-black leading-none text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  );
}

function RequestCard({
  row,
  onView,
  onCancel,
  canCancelRoute,
  cancelForm,
  cancelRow,
}) {
  const canCancel = row.status_pengajuan === 'Diajukan';
  const cancelDisabled = !canCancel || !canCancelRoute || cancelForm.processing;
  const hasAttachment = row.view_url || row.download_url || row.preview_url;

  return (
    <div className="group rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-emerald-50/30 hover:shadow-md">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
              {row.jenis_izin === 'Sakit' ? (
                <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
              ) : (
                <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
              {row.jenis_izin}
            </span>

            <Badge status={row.status_pengajuan} />

            <span
              className={classNames(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide',
                hasAttachment
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              )}
            >
              <Paperclip className="h-3.5 w-3.5" />
              {hasAttachment ? 'Lampiran Ada' : 'Tanpa Lampiran'}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-slate-50 px-3 py-1">
              Mulai: {formatDate(row.tanggal_mulai_izin)}
            </span>

            <span className="rounded-full bg-slate-50 px-3 py-1">
              Selesai: {formatDate(row.tanggal_selesai_izin)}
            </span>
          </div>

          <div className="mt-2 text-[11px] font-semibold text-slate-400">
            Diajukan: {formatDate(row.tanggal_pengajuan)}
            {row.tanggal_persetujuan ? ` • Diputuskan: ${formatDate(row.tanggal_persetujuan)}` : ''}
          </div>

          {row.keterangan && (
            <div className="mt-3 rounded-2xl bg-slate-50/80 px-3 py-2 text-sm font-medium leading-relaxed text-slate-700">
              {row.keterangan}
            </div>
          )}

          {row.status_pengajuan === 'Disetujui' && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              Pengajuan disetujui.
            </div>
          )}

          {row.status_pengajuan === 'Ditolak' && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">
              <ShieldX className="h-4 w-4" />
              Pengajuan ditolak.
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onView(row)}
            className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800"
          >
            <Eye className="h-4 w-4" />
            View Surat
          </button>

          <button
            type="button"
            disabled={cancelDisabled}
            onClick={() => onCancel(row)}
            className={classNames(
              'inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ring-1 transition',
              cancelDisabled
                ? 'cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200'
                : 'bg-white text-rose-700 ring-rose-200 hover:bg-rose-50'
            )}
            title={
              !canCancel
                ? 'Hanya bisa dibatalkan saat status Diajukan'
                : !canCancelRoute
                  ? 'Route orangtua.surat-izin.cancel belum tersedia'
                  : 'Batalkan pengajuan'
            }
          >
            {cancelForm.processing && cancelRow?.id_surat === row.id_surat ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Batalkan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const { siswa, izin, filters, flash } = usePage().props;

  const form = useForm({
    jenis_izin: 'Izin',
    tanggal_mulai_izin: '',
    tanggal_selesai_izin: '',
    keterangan: '',
    file_lampiran: null,
  });

  const cancelForm = useForm({});

  const [viewRow, setViewRow] = useState(null);
  const [cancelRow, setCancelRow] = useState(null);

  const canSubmit = useMemo(() => {
    const ket = (form.data.keterangan || '').trim();
    const start = form.data.tanggal_mulai_izin;
    const end = form.data.tanggal_selesai_izin;

    return !!start && !!end && ket.length >= 5;
  }, [form.data]);

  const submit = (event) => {
    event.preventDefault();

    form.post(safeRoute('orangtua.surat-izin.store'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => form.reset('keterangan', 'file_lampiran'),
    });
  };

  const canCancelRoute = routeExists('orangtua.surat-izin.cancel');

  const doCancel = () => {
    if (!cancelRow) return;

    cancelForm.post(safeRoute('orangtua.surat-izin.cancel', { surat: cancelRow.id_surat }), {
      preserveScroll: true,
      onFinish: () => setCancelRow(null),
    });
  };

  const currentStatus = filters?.status || 'Semua';
  const currentJenis = filters?.jenis || 'Semua';

  const rows = izin?.data || [];
  const totalRows = izin?.total ?? rows.length;
  const totalDiajukan = rows.filter((item) => item.status_pengajuan === 'Diajukan').length;
  const totalDisetujui = rows.filter((item) => item.status_pengajuan === 'Disetujui').length;
  const totalDitolak = rows.filter((item) => item.status_pengajuan === 'Ditolak').length;

  if (!siswa) {
    return (
      <OrangTuaLayout header="Pengajuan Surat Izin">
        <Head title="Pengajuan Surat Izin" />

        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/35 to-sky-50/60 py-12">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4">
            <PremiumCard className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-900">
                Siswa belum terhubung
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Akun orang tua ini belum terhubung dengan data siswa.
              </p>
            </PremiumCard>
          </div>
        </div>
      </OrangTuaLayout>
    );
  }

  return (
    <OrangTuaLayout header="Pengajuan Surat Izin">
      <Head title="Pengajuan Surat Izin" />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/35 to-sky-50/60 py-5 sm:py-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
          {/* HERO */}
          <PremiumCard className="relative overflow-hidden p-0" delay={0}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-emerald-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-50 backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    Pengajuan Izin / Sakit
                  </div>

                  <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                    Surat Izin Ananda
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                    Buat pengajuan izin atau sakit untuk{' '}
                    <span className="font-black text-emerald-100">
                      {siswa?.nama_lengkap}
                    </span>
                    . Pantau status persetujuan langsung dari halaman ini.
                  </p>

                  {(flash?.success || flash?.error) && (
                    <div className="mt-4">
                      {flash?.success && (
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur-md">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="font-black">Berhasil:</span> {flash.success}
                        </div>
                      )}

                      {flash?.error && (
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-black">Gagal:</span> {flash.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[480px]">
                  <StatMiniCard label="Total" value={totalRows} icon={ClipboardList} />
                  <StatMiniCard label="Diajukan" value={totalDiajukan} icon={Clock} />
                  <StatMiniCard label="Disetujui" value={totalDisetujui} icon={ShieldCheck} />
                  <StatMiniCard label="Ditolak" value={totalDitolak} icon={ShieldX} />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* FILTER */}
          <PremiumCard className="p-3 sm:p-4" delay={80}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Filter className="h-5 w-5" />
                </div>
                Filter cepat
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <PillLink
                  href={safeRoute('orangtua.surat-izin.index', { status: 'Semua', jenis: 'Semua' })}
                  active={currentStatus === 'Semua' && currentJenis === 'Semua'}
                >
                  Semua
                </PillLink>

                <PillLink
                  href={safeRoute('orangtua.surat-izin.index', { status: 'Diajukan', jenis: currentJenis })}
                  active={currentStatus === 'Diajukan'}
                >
                  <Clock className="h-4 w-4" />
                  Diajukan
                </PillLink>

                <PillLink
                  href={safeRoute('orangtua.surat-izin.index', { status: 'Disetujui', jenis: currentJenis })}
                  active={currentStatus === 'Disetujui'}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Disetujui
                </PillLink>

                <PillLink
                  href={safeRoute('orangtua.surat-izin.index', { status: 'Ditolak', jenis: currentJenis })}
                  active={currentStatus === 'Ditolak'}
                >
                  <ShieldX className="h-4 w-4" />
                  Ditolak
                </PillLink>

                <Link
                  href={safeRoute('orangtua.surat-izin.index', { status: 'Semua', jenis: 'Semua' })}
                  preserveScroll
                  className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Link>
              </div>
            </div>
          </PremiumCard>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            {/* FORM */}
            <div className="lg:col-span-2">
              <PremiumCard className="p-4 sm:p-5" delay={120}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                      <Send className="h-3.5 w-3.5" />
                      Buat Pengajuan
                    </div>

                    <h2 className="mt-2 text-lg font-black text-slate-900">
                      Izin / Sakit
                    </h2>

                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                      Isi tanggal, alasan singkat, dan lampiran bila diperlukan.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                    <FileUp className="h-3.5 w-3.5" />
                    Opsional
                  </span>
                </div>

                <form onSubmit={submit} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                      Jenis Pengajuan
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => form.setData('jenis_izin', 'Izin')}
                        className={classNames(
                          'rounded-2xl px-4 py-3 text-sm font-black ring-1 transition-all duration-300',
                          form.data.jenis_izin === 'Izin'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 ring-emerald-500'
                            : 'bg-white text-slate-700 ring-slate-200 hover:bg-emerald-50'
                        )}
                      >
                        Izin
                      </button>

                      <button
                        type="button"
                        onClick={() => form.setData('jenis_izin', 'Sakit')}
                        className={classNames(
                          'rounded-2xl px-4 py-3 text-sm font-black ring-1 transition-all duration-300',
                          form.data.jenis_izin === 'Sakit'
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 ring-rose-500'
                            : 'bg-white text-slate-700 ring-slate-200 hover:bg-rose-50'
                        )}
                      >
                        Sakit
                      </button>
                    </div>

                    {form.errors.jenis_izin && (
                      <div className="mt-2 text-xs font-semibold text-rose-600">
                        {form.errors.jenis_izin}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                        Mulai
                      </label>

                      <input
                        type="date"
                        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                        value={form.data.tanggal_mulai_izin}
                        onChange={(event) => form.setData('tanggal_mulai_izin', event.target.value)}
                      />

                      {form.errors.tanggal_mulai_izin && (
                        <div className="mt-2 text-xs font-semibold text-rose-600">
                          {form.errors.tanggal_mulai_izin}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                        Selesai
                      </label>

                      <input
                        type="date"
                        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                        value={form.data.tanggal_selesai_izin}
                        onChange={(event) => form.setData('tanggal_selesai_izin', event.target.value)}
                        min={form.data.tanggal_mulai_izin || undefined}
                      />

                      {form.errors.tanggal_selesai_izin && (
                        <div className="mt-2 text-xs font-semibold text-rose-600">
                          {form.errors.tanggal_selesai_izin}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                      Keterangan
                    </label>

                    <textarea
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                      value={form.data.keterangan}
                      onChange={(event) => form.setData('keterangan', event.target.value)}
                      placeholder="Contoh: demam, kontrol dokter, urusan keluarga, dll..."
                    />

                    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                      <div
                        className={classNames(
                          'inline-flex items-center gap-2 font-bold',
                          (form.data.keterangan || '').trim().length < 5
                            ? 'text-slate-400'
                            : 'text-emerald-700'
                        )}
                      >
                        {(form.data.keterangan || '').trim().length < 5 ? (
                          <>
                            <AlertTriangle className="h-4 w-4" />
                            Minimal 5 karakter
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Oke
                          </>
                        )}
                      </div>

                      <div className="font-bold text-slate-400">
                        {(form.data.keterangan || '').length}/500
                      </div>
                    </div>

                    {form.errors.keterangan && (
                      <div className="mt-2 text-xs font-semibold text-rose-600">
                        {form.errors.keterangan}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                      Lampiran
                    </label>

                    <Dropzone
                      value={form.data.file_lampiran}
                      onChange={(file) => form.setData('file_lampiran', file)}
                      error={form.errors.file_lampiran}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit || form.processing}
                    className={classNames(
                      'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-300',
                      !canSubmit || form.processing
                        ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 hover:-translate-y-0.5 hover:brightness-105'
                    )}
                  >
                    {form.processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {form.processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                  </button>

                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-slate-500">
                    Setelah dikirim, tunggu persetujuan. Jika status masih <b>Diajukan</b>, pengajuan masih bisa dibatalkan.
                  </div>
                </form>
              </PremiumCard>
            </div>

            {/* LIST */}
            <div className="lg:col-span-3">
              <PremiumCard className="p-4 sm:p-5" delay={160}>
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-sky-700">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Riwayat Pengajuan
                    </div>

                    <h2 className="mt-2 text-lg font-black text-slate-900">
                      Daftar Surat Izin
                    </h2>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Total: <span className="font-black">{totalRows}</span> pengajuan
                    </p>
                  </div>

                  <Link
                    href={safeRoute('orangtua.surat-izin.index', { status: 'Semua', jenis: 'Semua' })}
                    preserveScroll
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-100"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset filter
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {rows.map((row) => (
                    <RequestCard
                      key={row.id_surat}
                      row={row}
                      onView={setViewRow}
                      onCancel={setCancelRow}
                      canCancelRoute={canCancelRoute}
                      cancelForm={cancelForm}
                      cancelRow={cancelRow}
                    />
                  ))}

                  {rows.length === 0 && <EmptyState />}
                </div>

                {izin?.links && izin.links.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {izin.links.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.url || '#'}
                        preserveScroll
                        className={classNames(
                          'rounded-2xl px-3 py-1.5 text-xs font-black ring-1 ring-slate-200 transition',
                          link.active
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ring-emerald-500'
                            : 'bg-white text-slate-700 hover:bg-slate-50',
                          !link.url && 'pointer-events-none opacity-40'
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                )}
              </PremiumCard>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW SURAT MODAL */}
      <Modal
        open={!!viewRow}
        onClose={() => setViewRow(null)}
        title={viewRow ? `Surat Izin #${viewRow.id_surat}` : 'Surat Izin'}
        subtitle={
          viewRow
            ? `${viewRow.jenis_izin} • ${formatDate(viewRow.tanggal_mulai_izin)} → ${formatDate(viewRow.tanggal_selesai_izin)}`
            : ''
        }
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-semibold text-slate-500">
              {viewRow?.status_pengajuan === 'Diajukan' && 'Status masih Diajukan — masih bisa dibatalkan.'}
              {viewRow?.status_pengajuan === 'Disetujui' && 'Status Disetujui.'}
              {viewRow?.status_pengajuan === 'Ditolak' && 'Status Ditolak.'}
            </div>

            {(viewRow?.view_url || viewRow?.download_url) && (
              <a
                href={viewRow.view_url || viewRow.download_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" />
                Buka di tab baru
              </a>
            )}
          </div>
        }
      >
        {viewRow && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge status={viewRow.status_pengajuan} />

              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                Diajukan: {formatDate(viewRow.tanggal_pengajuan)}
              </span>

              {viewRow.tanggal_persetujuan && (
                <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                  Diputuskan: {formatDate(viewRow.tanggal_persetujuan)}
                </span>
              )}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="text-sm font-black text-slate-900">
                Keterangan
              </div>

              <div className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">
                {viewRow.keterangan || '-'}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-4">
              <div className="text-sm font-black text-slate-900">
                Lampiran
              </div>

              <div className="mt-3">
                <AttachmentViewer row={viewRow} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CANCEL CONFIRM MODAL */}
      <Modal
        open={!!cancelRow}
        onClose={() => (cancelForm.processing ? null : setCancelRow(null))}
        title="Batalkan pengajuan?"
        subtitle={
          cancelRow
            ? `#${cancelRow.id_surat} • ${cancelRow.jenis_izin} • ${formatDate(cancelRow.tanggal_mulai_izin)} → ${formatDate(cancelRow.tanggal_selesai_izin)}`
            : ''
        }
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={cancelForm.processing}
              onClick={() => setCancelRow(null)}
              className={classNames(
                'inline-flex min-h-10 items-center justify-center rounded-2xl px-4 py-2 text-sm font-black ring-1 transition',
                cancelForm.processing
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200'
                  : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
              )}
            >
              Tidak
            </button>

            <button
              type="button"
              disabled={cancelForm.processing || !canCancelRoute}
              onClick={doCancel}
              className={classNames(
                'inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition',
                cancelForm.processing || !canCancelRoute
                  ? 'cursor-not-allowed bg-rose-100 text-rose-300'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 hover:brightness-105'
              )}
              title={!canCancelRoute ? 'Route orangtua.surat-izin.cancel belum ada' : 'Konfirmasi pembatalan'}
            >
              {cancelForm.processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Ya, Batalkan
            </button>
          </div>
        }
      >
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-relaxed text-rose-800">
          Pengajuan yang dibatalkan tidak akan diproses oleh admin. Kalau perlu, orang tua bisa membuat pengajuan baru.
        </div>

        {!canCancelRoute && (
          <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
            Tombol batal butuh route <b>orangtua.surat-izin.cancel</b>. Saat ini belum terdeteksi oleh Ziggy.
          </div>
        )}
      </Modal>

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.55) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.45);
          border-radius: 999px;
        }

        @keyframes softRise {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-soft-rise {
          animation: softRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-modal-pop {
          animation: modalPop 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </OrangTuaLayout>
  );
}