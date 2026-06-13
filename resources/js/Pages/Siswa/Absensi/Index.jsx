// resources/js/Pages/Siswa/Absensi/Index.jsx

import React, { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import Pagination from '@/Components/Pagination';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  Heart,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  XCircle,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

function safeRoute(name, params = {}, fallback = '#') {
  try {
    if (typeof route === 'function') return route(name, params);
    if (typeof window !== 'undefined' && typeof window.route === 'function') {
      return window.route(name, params);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function formatDate(value, options = {}) {
  if (!value) return '—';

  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
      weekday: options.weekday || undefined,
      day: 'numeric',
      month: options.shortMonth ? 'short' : 'long',
      year: options.year === false ? undefined : 'numeric',
    });
  } catch {
    return value;
  }
}

function formatTime(value) {
  if (!value) return '—';
  return String(value).slice(0, 5);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function statusMeta(status) {
  const map = {
    Hadir: {
      label: 'Hadir',
      tone: 'emerald',
      icon: CheckCircle2,
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      solid: 'bg-emerald-500',
    },
    Izin: {
      label: 'Izin',
      tone: 'sky',
      icon: Plus,
      className: 'border-sky-200 bg-sky-50 text-sky-700',
      solid: 'bg-sky-500',
    },
    Sakit: {
      label: 'Sakit',
      tone: 'amber',
      icon: Heart,
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      solid: 'bg-amber-500',
    },
    Alfa: {
      label: 'Alfa',
      tone: 'rose',
      icon: AlertCircle,
      className: 'border-rose-200 bg-rose-50 text-rose-700',
      solid: 'bg-rose-500',
    },
    Terlambat: {
      label: 'Terlambat',
      tone: 'rose',
      icon: Timer,
      className: 'border-rose-200 bg-rose-50 text-rose-700',
      solid: 'bg-rose-500',
    },
  };

  return map[status] || {
    label: status || 'Kosong',
    tone: 'slate',
    icon: CalendarDays,
    className: 'border-slate-200 bg-slate-50 text-slate-600',
    solid: 'bg-slate-300',
  };
}

function AttendanceStatusTag({ status }) {
  const meta = statusMeta(status);
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide',
        meta.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

function PremiumCard({ children, className = '', delay = 0 }) {
  return (
    <div
      className={cn(
        'animate-soft-rise rounded-[2rem] border border-white/70 bg-white/90',
        'shadow-[0_22px_70px_-42px_rgba(15,23,42,0.7)] backdrop-blur-xl',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_32px_80px_-44px_rgba(15,23,42,0.8)]',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function HeroStat({ label, value, icon: Icon, tone = 'cyan' }) {
  const iconTones = {
    cyan: 'text-cyan-300',
    emerald: 'text-emerald-300',
    amber: 'text-amber-300',
    rose: 'text-rose-300',
    sky: 'text-sky-300',
    slate: 'text-slate-300',
  };

  return (
    <div className="rounded-3xl border border-white/20 bg-white/15 p-3 text-center backdrop-blur-md">
      <Icon className={cn('mx-auto h-5 w-5', iconTones[tone] || iconTones.cyan)} />

      <p className="mt-2 text-2xl font-black leading-none text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/80">
        {label}
      </p>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone = 'cyan', hint = null }) {
  const tones = {
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  };

  return (
    <PremiumCard className="p-4" delay={80}>
      <div className="flex items-start gap-3">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', tones[tone] || tones.cyan)}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-lg font-black text-slate-900">
            {value}
          </p>

          {hint && (
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
              {hint}
            </p>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}

function TabButton({ active, children, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition-all duration-300',
        active
          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
          : 'text-slate-600 hover:bg-white hover:text-cyan-700'
      )}
    >
      <Icon className="h-5 w-5" />
      {children}
    </button>
  );
}

function LegendItem({ status }) {
  const meta = statusMeta(status);
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 shadow-sm">
      <div className={cn('flex h-7 w-7 items-center justify-center rounded-xl text-white', meta.solid)}>
        <Icon className="h-4 w-4" />
      </div>

      <span className="text-xs font-black text-slate-600">
        {status}
      </span>
    </div>
  );
}

function CalendarGrid({
  month,
  year,
  absensiHarian = {},
  selectedDate,
  onDateClick,
}) {
  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const monthDays = useMemo(() => {
    const firstOfMonth = new Date(year, month - 1, 1);
    const firstDayIndex = (firstOfMonth.getDay() + 6) % 7;
    const totalDays = new Date(year, month, 0).getDate();

    return Array.from({ length: firstDayIndex }, () => null).concat(
      Array.from({ length: totalDays }, (_, index) => index + 1)
    );
  }, [month, year]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-7 gap-2 sm:gap-3">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
          <div
            key={day}
            className="select-none py-1 text-center text-[10px] font-black uppercase tracking-wide text-slate-400 sm:text-xs"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {monthDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-12 sm:h-14" />;
          }

          const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const record = absensiHarian?.[dateString];
          const status = record?.status_kehadiran;
          const meta = statusMeta(status);
          const Icon = meta.icon;
          const isToday = dateString === today;
          const isSelected = dateString === selectedDate;
          const isSunday = index % 7 === 6;

          return (
            <button
              key={dateString}
              type="button"
              onClick={() => onDateClick(dateString)}
              className={cn(
                'group relative flex h-12 items-center justify-center rounded-2xl border text-sm font-black transition-all duration-300 sm:h-14',
                status
                  ? `${meta.solid} border-transparent text-white shadow-lg`
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700',
                isToday && 'ring-2 ring-cyan-400 ring-offset-2',
                isSelected && 'scale-105 ring-2 ring-blue-500 ring-offset-2',
                !status && isSunday && 'text-rose-500'
              )}
              aria-pressed={isSelected}
            >
              <span>{day}</span>

              {status && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-sm backdrop-blur">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <LegendItem status="Hadir" />
        <LegendItem status="Izin" />
        <LegendItem status="Sakit" />
        <LegendItem status="Alfa" />
      </div>
    </div>
  );
}

function DetailPanel({
  selectedDate,
  absensiHarian = {},
  absensiMapel = {},
}) {
  const harian = selectedDate ? absensiHarian?.[selectedDate] : null;
  const mapelList = selectedDate ? absensiMapel?.[selectedDate] || [] : [];

  if (!selectedDate) {
    return (
      <PremiumCard className="p-6 text-center" delay={160}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
          <CalendarDays className="h-8 w-8" />
        </div>

        <h3 className="mt-4 text-base font-black text-slate-800">
          Pilih Tanggal
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
          Ketuk salah satu tanggal pada kalender untuk melihat detail kehadiran harian dan mapel.
        </p>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="overflow-hidden p-0" delay={160}>
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900">
              Detail Kehadiran
            </h3>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {formatDate(selectedDate, { weekday: 'long' })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
            Absensi Harian
          </p>

          {harian ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <AttendanceStatusTag status={harian.status_kehadiran} />

                <span
                  className={cn(
                    'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide',
                    toNumber(harian.menit_keterlambatan) > 0
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  )}
                >
                  {toNumber(harian.menit_keterlambatan) > 0
                    ? `${harian.menit_keterlambatan} Menit`
                    : 'Tepat Waktu'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Masuk
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-slate-800">
                    {formatTime(harian.jam_masuk)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Pulang
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-slate-800">
                    {formatTime(harian.jam_pulang)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center text-xs font-bold text-slate-400">
              Tidak ada catatan harian.
            </div>
          )}
        </div>

        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
            Kehadiran Mata Pelajaran
          </p>

          <div className="custom-scrollbar max-h-96 space-y-3 overflow-y-auto pr-1">
            {mapelList.length > 0 ? (
              mapelList.map((absen, index) => (
                <div
                  key={absen.id_absensi_mapel || index}
                  className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex min-w-0 items-center gap-2 text-sm font-black text-slate-800">
                        <BookOpen className="h-4 w-4 shrink-0 text-cyan-600" />
                        <span className="truncate">
                          {absen?.jadwal?.mapel?.nama_mapel || absen?.mapel?.nama_mapel || 'Mata Pelajaran'}
                        </span>
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatTime(absen.jam_mulai)} - {formatTime(absen.jam_selesai)}
                      </p>
                    </div>

                    <AttendanceStatusTag status={absen.status_kehadiran} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-black text-slate-500">
                  Tidak ada jadwal pelajaran
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

function RiwayatTab({
  riwayatKehadiran = {
    data: [],
    links: [],
  },
  filters = {},
}) {
  const rows = Array.isArray(riwayatKehadiran?.data) ? riwayatKehadiran.data : [];

  const {
    data,
    setData,
    processing,
  } = useForm({
    status: filters.status || 'Semua',
    tanggal_mulai: filters.tanggal_mulai || '',
    tanggal_selesai: filters.tanggal_selesai || '',
  });

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    router.get(
      safeRoute('siswa.absensi.index'),
      {
        ...data,
        tab: 'riwayat',
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    );
  };

  const resetFilter = () => {
    setData({
      status: 'Semua',
      tanggal_mulai: '',
      tanggal_selesai: '',
    });

    router.get(
      safeRoute('siswa.absensi.index'),
      {
        tab: 'riwayat',
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    );
  };

  return (
    <div className="space-y-6">
      <PremiumCard className="p-4 sm:p-5" delay={100}>
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Filter className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-black text-slate-900">
                  Filter Riwayat Kehadiran
                </h2>

                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                  Saring data berdasarkan status kehadiran dan rentang tanggal.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                <BarChart3 className="h-4 w-4" />
                Menampilkan {rows.length}
              </span>

              <button
                type="button"
                onClick={resetFilter}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                Status Kehadiran
              </label>

              <select
                value={data.status}
                onChange={(event) => setData('status', event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              >
                <option>Semua</option>
                <option>Hadir</option>
                <option>Sakit</option>
                <option>Izin</option>
                <option>Alfa</option>
                <option>Terlambat</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                Dari Tanggal
              </label>

              <input
                type="date"
                value={data.tanggal_mulai}
                onChange={(event) => setData('tanggal_mulai', event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                Sampai Tanggal
              </label>

              <input
                type="date"
                value={data.tanggal_selesai}
                onChange={(event) => setData('tanggal_selesai', event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              />
            </div>

            <div className="flex items-end lg:col-span-3">
              <button
                type="submit"
                disabled={processing}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                Filter Riwayat
              </button>
            </div>
          </div>
        </form>
      </PremiumCard>

      <PremiumCard className="overflow-hidden p-0" delay={120}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-4">Tanggal Kehadiran</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Masuk</th>
                <th className="px-6 py-4">Pulang</th>
                <th className="px-6 py-4">Keterlambatan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {rows.length > 0 ? (
                rows.map((absen) => (
                  <tr
                    key={absen.id_absensi}
                    className="bg-white transition hover:bg-cyan-50/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-black text-slate-800">
                      {formatDate(absen.tanggal, { weekday: 'long' })}
                    </td>

                    <td className="px-6 py-4">
                      <AttendanceStatusTag status={absen.status_kehadiran} />
                    </td>

                    <td className="px-6 py-4 font-mono font-black text-slate-700">
                      {formatTime(absen.jam_masuk)}
                    </td>

                    <td className="px-6 py-4 font-mono font-black text-slate-700">
                      {formatTime(absen.jam_pulang)}
                    </td>

                    <td
                      className={cn(
                        'px-6 py-4 font-black',
                        toNumber(absen.menit_keterlambatan) > 0
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      )}
                    >
                      {toNumber(absen.menit_keterlambatan) > 0
                        ? `${absen.menit_keterlambatan} Menit`
                        : 'Tepat Waktu'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-3 text-sm font-black text-slate-500">
                      Tidak ada riwayat kehadiran
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      Coba sesuaikan filter status atau tanggal.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {riwayatKehadiran?.links && rows.length > 0 && (
          <div className="border-t border-slate-100 p-4">
            <Pagination links={riwayatKehadiran.links} />
          </div>
        )}
      </PremiumCard>
    </div>
  );
}

function MapelTab({ absensiMapel = {} }) {
  const flattened = useMemo(() => {
    const arr = [];
    Object.keys(absensiMapel).forEach((date) => {
      absensiMapel[date].forEach((absen) => {
        arr.push({ ...absen, tanggal: date });
      });
    });
    return arr.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  }, [absensiMapel]);

  return (
    <div className="space-y-6">
      <PremiumCard className="overflow-hidden p-0" delay={120}>
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Detail Absensi Mata Pelajaran
              </h2>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                Data kehadiran mapel bulan ini.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-4">Tanggal & Waktu</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4">Guru</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {flattened.length > 0 ? (
                flattened.map((absen, index) => (
                  <tr
                    key={absen.id_absensi_mapel || index}
                    className="bg-white transition hover:bg-cyan-50/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-black text-slate-800">
                      <div>{formatDate(absen.tanggal, { weekday: 'long' })}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatTime(absen.jam_mulai)} - {formatTime(absen.jam_selesai)}</div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-700">
                      {absen?.jadwal?.mata_pelajaran?.nama_mapel || absen?.jadwal?.mapel?.nama_mapel || absen?.mapel?.nama_mapel || 'Mata Pelajaran'}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {absen?.jadwal?.guru?.nama_lengkap || '-'}
                    </td>

                    <td className="px-6 py-4">
                      <AttendanceStatusTag status={absen.status_kehadiran} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-14 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-3 text-sm font-black text-slate-500">
                      Tidak ada catatan kehadiran mapel
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </div>
  );
}

export default function AbsensiIndex({
  auth,
  siswa,
  absensiHarian = {},
  absensiMapel = {},
  riwayatKehadiran = {
    data: [],
    links: [],
  },
  filters = {},
}) {
  const [activeTab, setActiveTab] = useState(filters.tab || 'kalender');
  const [selectedDate, setSelectedDate] = useState(null);

  const {
    data,
    setData,
    processing,
  } = useForm({
    bulan: filters.bulan || new Date().getMonth() + 1,
    tahun: filters.tahun || new Date().getFullYear(),
  });

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => currentYear - index);

  const summary = useMemo(() => {
    const records = Object.values(absensiHarian || {});

    const hadir = records.filter((item) => item?.status_kehadiran === 'Hadir').length;
    const izin = records.filter((item) => item?.status_kehadiran === 'Izin').length;
    const sakit = records.filter((item) => item?.status_kehadiran === 'Sakit').length;
    const alfa = records.filter((item) => item?.status_kehadiran === 'Alfa').length;

    const terlambat = records.filter((item) => toNumber(item?.menit_keterlambatan) > 0).length;
    const total = records.length;
    const persenHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;

    return {
      hadir,
      izin,
      sakit,
      alfa,
      terlambat,
      total,
      persenHadir,
    };
  }, [absensiHarian]);

  const handleMonthYearChange = (event) => {
    event.preventDefault();

    router.get(
      safeRoute('siswa.absensi.index'),
      {
        bulan: data.bulan,
        tahun: data.tahun,
        tab: 'kalender',
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    );
  };

  return (
    <SiswaLayout
      user={auth?.user}
      header="Riwayat Kehadiran"
      subtitle="Pantau absensi harian dan kehadiran per mata pelajaran."
      className="bg-slate-50 font-sans"
    >
      <Head title="Lihat Absensi" />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/50 to-sky-50/70 pb-28 lg:pb-10">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-44 h-80 w-80 translate-x-24 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

        <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-6 lg:px-8 lg:py-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 p-4 text-white shadow-[0_28px_90px_-55px_rgba(15,23,42,0.9)] sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 translate-y-12 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Attendance Center
                </div>

                <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                  Riwayat Absensi
                </h1>

                <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-white/80">
                  Pantau catatan kehadiran harian, detail absensi per mata pelajaran,
                  keterlambatan, dan riwayat kehadiran secara berkala.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {months[toNumber(data.bulan, 1) - 1]} {data.tahun}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Kehadiran {summary.persenHadir}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[560px]">
                <HeroStat label="Hadir" value={summary.hadir} icon={CheckCircle2} tone="emerald" />
                <HeroStat label="Izin/Sakit" value={summary.izin + summary.sakit} icon={Heart} tone="amber" />
                <HeroStat label="Alfa" value={summary.alfa} icon={XCircle} tone="rose" />
                <HeroStat label="Telat" value={summary.terlambat} icon={Timer} tone="sky" />
              </div>
            </div>
          </section>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard label="Hadir" value={summary.hadir} icon={CheckCircle2} tone="emerald" hint="Catatan bulan aktif" />
            <MetricCard label="Izin / Sakit" value={summary.izin + summary.sakit} icon={Heart} tone="amber" hint="Izin dan sakit" />
            <MetricCard label="Alfa" value={summary.alfa} icon={XCircle} tone="rose" hint="Tidak hadir tanpa keterangan" />
            <MetricCard label="Persentase" value={`${summary.persenHadir}%`} icon={TrendingUp} tone="cyan" hint="Dari data bulan aktif" />
          </div>

          {/* Tab */}
          <PremiumCard className="p-2" delay={90}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <TabButton
                active={activeTab === 'kalender'}
                onClick={() => setActiveTab('kalender')}
                icon={CalendarDays}
              >
                Tampilan Kalender
              </TabButton>

              <TabButton
                active={activeTab === 'riwayat'}
                onClick={() => setActiveTab('riwayat')}
                icon={BarChart3}
              >
                Tabel Riwayat Harian
              </TabButton>

              <TabButton
                active={activeTab === 'mapel'}
                onClick={() => setActiveTab('mapel')}
                icon={BookOpen}
              >
                Absensi Mapel
              </TabButton>
            </div>
          </PremiumCard>

          {activeTab === 'kalender' && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <section className="xl:col-span-8">
                <PremiumCard className="overflow-hidden p-0" delay={120}>
                  <div className="border-b border-slate-100 p-5 sm:p-6">
                    <form
                      onSubmit={handleMonthYearChange}
                      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                          <CalendarDays className="h-6 w-6" />
                        </div>

                        <div>
                          <h2 className="text-lg font-black text-slate-900">
                            Kalender Kehadiran
                          </h2>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {months[toNumber(data.bulan, 1) - 1]} {data.tahun}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={data.bulan}
                          onChange={(event) => setData('bulan', event.target.value)}
                          className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                        >
                          {months.map((monthName, index) => (
                            <option key={monthName} value={index + 1}>
                              {monthName}
                            </option>
                          ))}
                        </select>

                        <select
                          value={data.tahun}
                          onChange={(event) => setData('tahun', event.target.value)}
                          className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                        >
                          {years.map((yearItem) => (
                            <option key={yearItem} value={yearItem}>
                              {yearItem}
                            </option>
                          ))}
                        </select>

                        <button
                          type="submit"
                          disabled={processing}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-black text-white shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Filter className="h-5 w-5" />}
                          Tampilkan
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="p-4 sm:p-6">
                    <CalendarGrid
                      month={Number(data.bulan)}
                      year={Number(data.tahun)}
                      absensiHarian={absensiHarian}
                      selectedDate={selectedDate}
                      onDateClick={setSelectedDate}
                    />
                  </div>
                </PremiumCard>
              </section>

              <aside className="xl:col-span-4">
                <DetailPanel
                  selectedDate={selectedDate}
                  absensiHarian={absensiHarian}
                  absensiMapel={absensiMapel}
                />
              </aside>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <RiwayatTab
              riwayatKehadiran={riwayatKehadiran}
              filters={filters}
            />
          )}

          {activeTab === 'mapel' && (
            <MapelTab
              absensiMapel={absensiMapel}
            />
          )}
        </main>
      </div>

      <style>{`
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

        .animate-soft-rise {
          animation: softRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.35);
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.45);
        }
      `}</style>
    </SiswaLayout>
  );
}