// resources/js/Pages/Guru/AbsensiHarian/IzinModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
  X,
  Send,
  CalendarDays,
  FileText,
  Stethoscope,
  Info,
  BriefcaseBusiness,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

function safeRoute(name, params = {}, fallback = '#') {
  try {
    return route(name, params);
  } catch {
    return fallback;
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-xs font-semibold text-rose-600">
      {message}
    </p>
  );
}

function StatusOption({
  value,
  title,
  description,
  icon: Icon,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        'flex w-full items-start gap-3 rounded-3xl border p-4 text-left transition-all duration-300',
        active
          ? 'border-indigo-200 bg-indigo-50/90 ring-2 ring-indigo-500/10'
          : 'border-slate-200 bg-white hover:border-indigo-100 hover:bg-slate-50'
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm',
          active
            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
            : 'bg-slate-50 text-slate-500'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </button>
  );
}

export default function IzinModal({
  show,
  onClose,
  defaultDate = null,
}) {
  const {
    data,
    setData,
    post,
    processing,
    errors,
    reset,
    clearErrors,
  } = useForm({
    status: 'Sakit',
    keterangan: '',
    tanggal: defaultDate || getToday(),
  });

  useEffect(() => {
    if (!show) {
      reset('keterangan');
      clearErrors();

      setData({
        status: 'Sakit',
        keterangan: '',
        tanggal: defaultDate || getToday(),
      });
    }
  }, [show, defaultDate]);

  useEffect(() => {
    if (!show) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  const closeModal = () => {
    if (processing) return;
    onClose?.();
  };

  const handleSubmit = (event) => {
    event?.preventDefault?.();

    if ((data.keterangan || '').trim().length < 3) {
      setData('keterangan', data.keterangan || '');
      return;
    }

    post(safeRoute('guru.absensi-harian.izin'), {
      preserveScroll: true,
      onSuccess: () => {
        onClose?.();
        reset('keterangan');
        clearErrors();

        setData({
          status: 'Sakit',
          keterangan: '',
          tanggal: defaultDate || getToday(),
        });
      },
    });
  };

  if (!show) return null;

  const keteranganKurang = (data.keterangan || '').trim().length > 0
    && (data.keterangan || '').trim().length < 3;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4"
    >
      <button
        type="button"
        aria-label="Tutup modal"
        className="absolute inset-0"
        onClick={closeModal}
      />

      <div className="animate-modal-pop relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 p-5 text-white sm:p-6">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-8 rounded-full bg-sky-200/20 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" />
                Pengajuan Absensi
              </div>

              <h3 className="mt-3 text-xl font-black leading-tight">
                Ajukan Sakit / Izin / Dinas Luar
              </h3>

              <p className="mt-1 max-w-xl text-sm font-medium leading-relaxed text-white/75">
                Isi data pengajuan dengan benar. Admin akan menerima informasi pengajuan absensi Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              disabled={processing}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[74vh] overflow-y-auto p-5 sm:p-6">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="tanggal"
                className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500"
              >
                Tanggal
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="tanggal"
                  type="date"
                  value={data.tanggal}
                  onChange={(event) => setData('tanggal', event.target.value)}
                  className={cn(
                    'min-h-11 w-full rounded-2xl border bg-white py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
                    errors.tanggal
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                  )}
                  required
                />
              </div>

              <FieldError message={errors.tanggal} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-xs font-black uppercase tracking-wide text-slate-500">
                  Status Pengajuan
                </label>

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
                  {data.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatusOption
                  value="Sakit"
                  title="Sakit"
                  description="Gunakan jika tidak masuk karena kondisi kesehatan."
                  icon={Stethoscope}
                  active={data.status === 'Sakit'}
                  onClick={(value) => setData('status', value)}
                />

                <StatusOption
                  value="Izin"
                  title="Izin"
                  description="Gunakan untuk keperluan pribadi atau keluarga."
                  icon={Info}
                  active={data.status === 'Izin'}
                  onClick={(value) => setData('status', value)}
                />

                <StatusOption
                  value="Dinas Luar"
                  title="Dinas Luar"
                  description="Gunakan jika ada tugas resmi di luar sekolah."
                  icon={BriefcaseBusiness}
                  active={data.status === 'Dinas Luar'}
                  onClick={(value) => setData('status', value)}
                />
              </div>

              <FieldError message={errors.status} />
            </div>

            <div>
              <label
                htmlFor="keterangan"
                className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500"
              >
                Keterangan
              </label>

              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

                <textarea
                  id="keterangan"
                  value={data.keterangan}
                  onChange={(event) => setData('keterangan', event.target.value)}
                  rows={5}
                  className={cn(
                    'w-full resize-none rounded-2xl border bg-white py-3 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
                    errors.keterangan || keteranganKurang
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                  )}
                  placeholder="Contoh: Sakit demam, izin keluarga, atau dinas luar mengikuti kegiatan sekolah..."
                  required
                />
              </div>

              {keteranganKurang && (
                <p className="mt-1.5 text-xs font-semibold text-rose-600">
                  Keterangan minimal 3 karakter.
                </p>
              )}

              <FieldError message={errors.keterangan} />
            </div>

            <div className="rounded-3xl border border-sky-100 bg-sky-50/80 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Catatan Pengajuan
                  </p>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Pastikan tanggal, status, dan keterangan sudah benar sebelum dikirim. Pengajuan akan diproses oleh admin sekolah.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={processing}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={processing || (data.keterangan || '').trim().length < 3}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
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

        .animate-modal-pop {
          animation: modalPop 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
}