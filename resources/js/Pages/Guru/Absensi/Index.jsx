// resources/js/Pages/Guru/Absensi/Index.jsx

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import Skeleton from '@/Components/Skeleton';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Brain,
  Pencil,
  RefreshCcw,
  Download,
  ChevronDown,
  XCircle,
  Sparkles,
  Users,
  BookOpen,
  CalendarDays,
  Clock,
  Filter,
  Save,
  Loader2,
  ShieldCheck,
  ClipboardCheck,
  FileSpreadsheet,
  X,
  Info,
  UserCheck,
  TimerReset,
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useDebounce } from 'use-debounce';

const EXCEPTIONS = ['Alfa_Mapel', 'Izin_Mapel', 'Sakit_Mapel', 'Tugas_Mapel'];

const cn = (...classes) => classes.filter(Boolean).join(' ');

const clampStyle = (lines = 1) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
});

function safeRoute(name, params = {}, fallback = '#') {
  try {
    return route(name, params);
  } catch {
    return fallback;
  }
}

function getKelasName(jadwal) {
  const kelas = jadwal?.kelas;

  if (!kelas) return '-';
  if (kelas?.nama_kelas) return kelas.nama_kelas;

  return [kelas?.tingkat, kelas?.jurusan].filter(Boolean).join(' ') || '-';
}

function formatDate(value) {
  if (!value) return '-';

  try {
    return new Date(value).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function statusLabel(status) {
  const labels = {
    Hadir: 'Hadir',
    Izin: 'Izin',
    Sakit: 'Sakit',
    Alfa: 'Alfa',
    Alfa_Mapel: 'Alfa Mapel',
    Izin_Mapel: 'Izin Mapel',
    Sakit_Mapel: 'Sakit Mapel',
    Tugas_Mapel: 'Tugas Mapel',
    'Belum Absen': 'Belum Absen',
  };

  return labels[status] || status || '-';
}

function statusTone(status, active = false) {
  const map = {
    Hadir: active
      ? 'border-emerald-600 bg-emerald-600 text-white shadow-emerald-200'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    Izin: active
      ? 'border-sky-600 bg-sky-600 text-white shadow-sky-200'
      : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
    Izin_Mapel: active
      ? 'border-sky-600 bg-sky-600 text-white shadow-sky-200'
      : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
    Sakit: active
      ? 'border-amber-600 bg-amber-600 text-white shadow-amber-200'
      : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
    Sakit_Mapel: active
      ? 'border-amber-600 bg-amber-600 text-white shadow-amber-200'
      : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
    Alfa: active
      ? 'border-rose-600 bg-rose-600 text-white shadow-rose-200'
      : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    Alfa_Mapel: active
      ? 'border-rose-600 bg-rose-600 text-white shadow-rose-200'
      : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    Tugas_Mapel: active
      ? 'border-indigo-600 bg-indigo-600 text-white shadow-indigo-200'
      : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    'Belum Absen': active
      ? 'border-slate-600 bg-slate-600 text-white shadow-slate-200'
      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
  };

  return map[status] || 'border-slate-200 bg-slate-50 text-slate-700';
}

function PremiumCard({ children, className = '', delay = 0 }) {
  return (
    <div
      className={cn(
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

function StatMiniCard({ label, value, icon: Icon }) {
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

function SummaryPill({ label, value, status }) {
  return (
    <div className={cn('rounded-3xl border px-3 py-2 text-center', statusTone(status))}>
      <p className="text-xl font-black leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wide opacity-80">
        {label}
      </p>
    </div>
  );
}

function StatusBadge({ status, prefix = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
        statusTone(status)
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {prefix}
      {statusLabel(status)}
    </span>
  );
}

function StudentAvatar({ name }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-black uppercase text-white shadow-lg shadow-indigo-200">
      {(name || '?').slice(0, 1)}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
        <Users className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-700">
        Tidak ada siswa sesuai filter
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Coba ubah kata kunci pencarian atau matikan filter hanya pengecualian.
      </p>
    </div>
  );
}

export default function Index({
  jadwal,
  siswaList = [],
  absensiHariIni = {},
  dailyStatusMap = {},
  today,
  filters = {},
  onlyToday = true,
  aksesEditAktif = null,
}) {
  const isLocked = onlyToday;
  const editable = !isLocked;

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showExceptionsOnly, setShowExceptionsOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tanggal, setTanggal] = useState(
    filters.tanggal || today || new Date().toISOString().slice(0, 10)
  );
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processingSave, setProcessingSave] = useState(false);
  const [dateWarning, setDateWarning] = useState('');

  const { data, setData, post, processing, errors, clearErrors } = useForm({
    id_jadwal: jadwal?.id_jadwal || null,
    tanggal,
    entries: [],
  });

  const TODAY = useMemo(
    () => today || new Date().toISOString().slice(0, 10),
    [today]
  );

  useEffect(() => {
    const entries = (siswaList || []).map((siswa) => {
      const absensi = absensiHariIni?.[siswa.id_siswa];

      return {
        id_siswa: siswa.id_siswa,
        status_kehadiran: absensi?.status_kehadiran || null,
        keterangan: absensi?.keterangan || '',
        is_overridden: absensi?.is_overridden === 1 || absensi?.is_overridden === true,
      };
    });

    setData('entries', entries);
    setData('id_jadwal', jadwal?.id_jadwal || null);
    setData('tanggal', tanggal);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siswaList, absensiHariIni, jadwal, today, tanggal]);

  useEffect(() => {
    if (!jadwal?.id_jadwal) return;

    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (tanggal) params.tanggal = tanggal;

    router.get(
      safeRoute('guru.absensi-mapel.show', { id_jadwal: jadwal.id_jadwal }),
      params,
      {
        preserveState: true,
        replace: true,
        onStart: () => setIsLoading(true),
        onFinish: () => setIsLoading(false),
      }
    );
  }, [debouncedSearch, tanggal, jadwal?.id_jadwal]);

  const getDaily = (idSiswa) => dailyStatusMap?.[idSiswa] ?? null;

  const allowedOptions = (idSiswa) => {
    const daily = getDaily(idSiswa);

    if (daily === 'Hadir') return ['Hadir', ...EXCEPTIONS];
    if (daily === 'Izin' || daily === 'Sakit' || daily === 'Alfa') return [daily];

    return ['Hadir', 'Sakit', 'Izin', 'Alfa', ...EXCEPTIONS, 'Belum Absen'];
  };

  const handleEntryChange = (index, field, value) => {
    if (!editable) return;

    const entries = [...(data.entries || [])];
    const entry = { ...(entries[index] || {}) };
    const idSiswa = entry.id_siswa;
    const daily = getDaily(idSiswa);

    if (field === 'status_kehadiran') {
      const allowed = allowedOptions(idSiswa);
      if (!allowed.includes(value)) return;

      if (daily === 'Hadir' && ['Izin', 'Sakit', 'Alfa'].includes(value)) {
        const map = {
          Izin: 'Izin_Mapel',
          Sakit: 'Sakit_Mapel',
          Alfa: 'Alfa_Mapel',
        };

        value = map[value];
      }

      entry.status_kehadiran = value;

      if (value === 'Hadir') {
        entry.keterangan = '';
      }

      entry.is_overridden =
        (daily === 'Hadir' && EXCEPTIONS.includes(value)) ||
        (!daily && value !== 'Belum Absen');
    }

    if (field === 'keterangan') {
      entry.keterangan = value;
    }

    entries[index] = entry;
    setData('entries', entries);
  };

  const setAllHadir = () => {
    if (!editable) return;

    setData(
      'entries',
      (data.entries || []).map((entry) => {
        const daily = getDaily(entry.id_siswa);

        if (daily === 'Hadir') {
          return {
            ...entry,
            status_kehadiran: 'Hadir',
            keterangan: '',
            is_overridden: false,
          };
        }

        return entry;
      })
    );
  };

  const setAllAlfaMapel = () => {
    if (!editable) return;

    setData(
      'entries',
      (data.entries || []).map((entry) => {
        const daily = getDaily(entry.id_siswa);

        if (daily === 'Hadir') {
          return {
            ...entry,
            status_kehadiran: 'Alfa_Mapel',
            is_overridden: true,
          };
        }

        return entry;
      })
    );
  };

  const filteredSiswa = useMemo(() => {
    const term = (debouncedSearch || '').toLowerCase().trim();

    let list = siswaList;

    if (term) {
      list = list.filter((siswa) => {
        const haystack = `${siswa.nama_lengkap} ${siswa.nis || ''}`.toLowerCase();
        return haystack.includes(term);
      });
    }

    if (showExceptionsOnly) {
      list = list.filter((siswa) => {
        const index = siswaList.findIndex((item) => item.id_siswa === siswa.id_siswa);
        const entry = data.entries?.[index];

        return entry && EXCEPTIONS.includes(entry.status_kehadiran);
      });
    }

    return list;
  }, [siswaList, debouncedSearch, showExceptionsOnly, data.entries]);

  const summary = useMemo(() => {
    const out = {
      Hadir: 0,
      Izin: 0,
      Sakit: 0,
      Alfa: 0,
      Alfa_Mapel: 0,
      Izin_Mapel: 0,
      Sakit_Mapel: 0,
      Tugas_Mapel: 0,
      total: (siswaList || []).length,
    };

    (data.entries || []).forEach((entry) => {
      const status = entry?.status_kehadiran;
      if (status && out[status] !== undefined) out[status] += 1;
    });

    return out;
  }, [data.entries, siswaList]);

  const handleSubmit = () => {
    clearErrors();
    setConfirmOpen(true);
  };

  const doSubmit = (event) => {
    event.preventDefault();

    if (!editable) return;

    setProcessingSave(true);

    post(safeRoute('guru.absensi-mapel.store'), {
      preserveScroll: true,
      onFinish: () => {
        setProcessingSave(false);
        setConfirmOpen(false);
      },
    });
  };

  const doRefreshPrefill = () => {
    if (!editable) {
      setDateWarning('Prefill hanya tersedia jika Anda memiliki akses edit.');
      return;
    }

    router.post(
      safeRoute('guru.absensi-mapel.prefill', { id_jadwal: jadwal.id_jadwal }),
      { tanggal },
      { preserveScroll: true }
    );
  };

  const exportMeeting = () => {
    window.location.href = safeRoute('guru.absensi-mapel.export.meeting', {
      id_jadwal: jadwal.id_jadwal,
      tanggal,
    });
  };

  const exportMonthly = () => {
    const month = (tanggal || '').slice(0, 7) || new Date().toISOString().slice(0, 7);

    window.location.href = safeRoute('guru.absensi-mapel.export.monthly', {
      id_jadwal: jadwal.id_jadwal,
      month,
    });
  };

  return (
    <GuruLayout header={`Absensi: ${jadwal?.mata_pelajaran?.nama_mapel || '-'}`}>
      <Head title={`Absensi ${getKelasName(jadwal)}`} />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
          {/* Hero */}
          <PremiumCard className="relative overflow-hidden p-0" delay={0}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    Absensi Mata Pelajaran
                  </div>

                  <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                    Absensi Kelas {getKelasName(jadwal)}
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                    Mapel{' '}
                    <span className="font-black text-indigo-100">
                      {jadwal?.mata_pelajaran?.nama_mapel || '-'}
                    </span>{' '}
                    pukul{' '}
                    <span className="font-black text-sky-100">
                      {jadwal?.jam_mulai?.slice(0, 5) || '-'} - {jadwal?.jam_selesai?.slice(0, 5) || '-'}
                    </span>
                    . Absensi mapel mengikuti status harian siswa dan bisa diberi pengecualian mapel.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {formatDate(tanggal)}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      Total {summary.total} Siswa
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {editable ? (aksesEditAktif ? 'Akses Edit Khusus Aktif' : 'Mode Edit Aktif') : 'Terkunci'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                  <StatMiniCard label="Siswa" value={summary.total} icon={Users} />
                  <StatMiniCard label="Hadir" value={summary.Hadir} icon={CheckCircle2} />
                  <StatMiniCard label="Pengecualian" value={summary.Alfa_Mapel + summary.Izin_Mapel + summary.Sakit_Mapel + summary.Tugas_Mapel} icon={Pencil} />
                  <StatMiniCard label="Alfa Mapel" value={summary.Alfa_Mapel} icon={XCircle} />
                </div>
              </div>
            </div>
          </PremiumCard>

          {dateWarning && (
            <PremiumCard className="border-amber-200 bg-amber-50/90 p-4" delay={50}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-amber-800">
                    Peringatan Tanggal
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-700">
                    {dateWarning}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDateWarning('')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 transition hover:bg-amber-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </PremiumCard>
          )}

          {/* Action Bar */}
          <PremiumCard className="p-3 sm:p-4" delay={70}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Link
                href={safeRoute('guru.absensi-mapel.index')}
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Link>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  <BookOpen className="h-4 w-4" />
                  {jadwal?.mata_pelajaran?.nama_mapel || '-'}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                  <Clock className="h-4 w-4" />
                  {jadwal?.jam_mulai?.slice(0, 5) || '-'} - {jadwal?.jam_selesai?.slice(0, 5) || '-'}
                </span>

                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide',
                    editable
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  )}
                >
                  {editable ? <UserCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {editable ? 'Bisa Edit' : 'Terkunci'}
                </span>

                {!editable && (
                  <Link
                    href={safeRoute('guru.akses-edit-absensi.index')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Ajukan Edit
                  </Link>
                )}
              </div>
            </div>
          </PremiumCard>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
            <SummaryPill label="Hadir" value={summary.Hadir} status="Hadir" />
            <SummaryPill label="Izin" value={summary.Izin} status="Izin" />
            <SummaryPill label="Sakit" value={summary.Sakit} status="Sakit" />
            <SummaryPill label="Alfa" value={summary.Alfa} status="Alfa" />
            <SummaryPill label="Alfa Mapel" value={summary.Alfa_Mapel} status="Alfa_Mapel" />
            <SummaryPill label="Izin Mapel" value={summary.Izin_Mapel} status="Izin_Mapel" />
            <SummaryPill label="Sakit Mapel" value={summary.Sakit_Mapel} status="Sakit_Mapel" />
            <SummaryPill label="Tugas Mapel" value={summary.Tugas_Mapel} status="Tugas_Mapel" />
          </div>

          {/* Toolbar */}
          <PremiumCard className="p-4 sm:p-5" delay={90}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Filter className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Filter & Aksi Cepat
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Cari siswa, tampilkan pengecualian, refresh prefill harian, atau export absensi.
                  </p>
                </div>
              </div>

              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105">
                  Aksi Cepat
                  <ChevronDown className="h-4 w-4" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-[80] mt-2 w-72 origin-top-right overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl focus:outline-none">
                    <div className="p-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={doRefreshPrefill}
                            disabled={!editable}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
                              active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                            )}
                          >
                            <RefreshCcw className="h-4 w-4" />
                            Refresh Prefill Harian
                          </button>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={setAllHadir}
                            disabled={!editable}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
                              active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
                            )}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Set Semua Hadir
                          </button>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={setAllAlfaMapel}
                            disabled={!editable}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
                              active ? 'bg-rose-50 text-rose-700' : 'text-slate-700'
                            )}
                          >
                            <XCircle className="h-4 w-4" />
                            Set Semua Alfa Mapel
                          </button>
                        )}
                      </Menu.Item>
                    </div>

                    <div className="border-t border-slate-100 p-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={exportMeeting}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition',
                              active ? 'bg-sky-50 text-sky-700' : 'text-slate-700'
                            )}
                          >
                            <Download className="h-4 w-4" />
                            Export Pertemuan
                          </button>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={exportMonthly}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition',
                              active ? 'bg-sky-50 text-sky-700' : 'text-slate-700'
                            )}
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                            Export Bulanan
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Tanggal
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    value={tanggal}
                    onChange={(event) => {
                      const value = event.target.value;
                      setTanggal(value);
                      setData('tanggal', value);
                    }}
                    title="Pilih tanggal"
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="lg:col-span-6">
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Cari Siswa
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    aria-label="Cari siswa"
                    type="search"
                    placeholder="Cari nama atau NIS siswa..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Filter
                </label>

                <button
                  type="button"
                  onClick={() => setShowExceptionsOnly((value) => !value)}
                  className={cn(
                    'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-black transition',
                    showExceptionsOnly
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Pencil className="h-4 w-4" />
                  {showExceptionsOnly ? 'Pengecualian Aktif' : 'Hanya Pengecualian'}
                </button>
              </div>
            </div>
          </PremiumCard>

          {aksesEditAktif && (
            <PremiumCard className="border-emerald-200 bg-emerald-50/90 p-4" delay={95}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-emerald-800">
                    Akses Edit Khusus Aktif
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-emerald-700">
                    Anda sedang menggunakan akses edit absensi yang telah disetujui admin.
                    Akses berlaku hingga {formatDate(aksesEditAktif.expired_at)}.
                  </p>
                </div>
              </div>
            </PremiumCard>
          )}

          {!editable && !aksesEditAktif && (
            <PremiumCard className="border-slate-200 bg-slate-50/90 p-4" delay={100}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
                  <Lock className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-relaxed text-slate-700">
                    Perubahan absensi terkunci karena waktu edit (24 jam) sudah habis. Export tetap bisa dilakukan.
                  </p>
                  <Link
                    href={safeRoute('guru.akses-edit-absensi.index')}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition"
                  >
                    Ajukan Akses Edit Absensi
                  </Link>
                </div>
              </div>
            </PremiumCard>
          )}

          {/* List */}
          <form onSubmit={doSubmit} className="space-y-4" aria-label="Form absensi">
            <PremiumCard className="overflow-hidden p-0" delay={120}>
              <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        Daftar Absensi Siswa
                      </h2>

                      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                        Menampilkan {filteredSiswa.length} dari {siswaList.length} siswa.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="Hadir" />
                    <StatusBadge status="Alfa_Mapel" />
                    <StatusBadge status="Tugas_Mapel" />
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="divide-y divide-slate-100">
                  {[...Array(10)].map((_, index) => (
                    <div key={index} className="grid grid-cols-12 items-center gap-4 p-4">
                      <div className="col-span-12 md:col-span-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-3xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-5 w-32 rounded-full" />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-12 flex flex-wrap gap-2 md:col-span-5">
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                      </div>

                      <div className="col-span-12 md:col-span-3">
                        <Skeleton className="h-11 w-full rounded-2xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSiswa.length === 0 ? (
                <div className="p-4">
                  <EmptyState />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredSiswa.map((siswa, rowIndex) => {
                    const index = siswaList.findIndex((item) => item.id_siswa === siswa.id_siswa);
                    const entry = data.entries?.[index] || {
                      id_siswa: siswa.id_siswa,
                      status_kehadiran: null,
                      keterangan: '',
                    };

                    const daily = getDaily(siswa.id_siswa);
                    const options = allowedOptions(siswa.id_siswa);

                    const isOverride =
                      entry.is_overridden === true ||
                      (daily === 'Hadir' && EXCEPTIONS.includes(entry.status_kehadiran));

                    const autoBadge = !isOverride && !!daily;
                    const lockedDaily = daily && daily !== 'Hadir';
                    const rowDisabled = !editable || lockedDaily;

                    return (
                      <div
                        key={siswa.id_siswa}
                        className={cn(
                          'grid grid-cols-12 items-start gap-4 p-4 transition hover:bg-indigo-50/30',
                          rowIndex % 2 === 1 && 'bg-slate-50/35'
                        )}
                      >
                        <div className="col-span-12 md:col-span-4">
                          <div className="flex items-start gap-3">
                            <StudentAvatar name={siswa.nama_panggilan || siswa.nama_lengkap} />

                            <div className="min-w-0">
                              <p className="font-black leading-snug text-slate-900" style={clampStyle(2)}>
                                {siswa.nama_lengkap}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-400">
                                NIS: {siswa.nis || '-'}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {daily ? (
                                  <StatusBadge status={daily} prefix="Harian: " />
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                    <Info className="h-3.5 w-3.5" />
                                    Harian Belum Ada
                                  </span>
                                )}

                                {autoBadge && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                    <Brain className="h-3.5 w-3.5" />
                                    Auto
                                  </span>
                                )}

                                {isOverride && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">
                                    <Pencil className="h-3.5 w-3.5" />
                                    Override
                                  </span>
                                )}

                                {lockedDaily && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700">
                                    <Lock className="h-3.5 w-3.5" />
                                    Terkunci
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-12 flex flex-wrap gap-2 md:col-span-5">
                          {options.map((option) => {
                            const active = entry.status_kehadiran === option;

                            return (
                              <button
                                key={`${siswa.id_siswa}-${option}`}
                                type="button"
                                disabled={rowDisabled}
                                onClick={() => handleEntryChange(index, 'status_kehadiran', option)}
                                className={cn(
                                  'rounded-full border px-3 py-2 text-xs font-black transition-all duration-200',
                                  active
                                    ? `${statusTone(option, true)} shadow-lg`
                                    : statusTone(option),
                                  rowDisabled && 'cursor-not-allowed opacity-50'
                                )}
                                aria-pressed={active}
                                aria-label={`Set ${siswa.nama_lengkap} = ${option}`}
                              >
                                {statusLabel(option)}
                              </button>
                            );
                          })}
                        </div>

                        <div className="col-span-12 md:col-span-3">
                          {entry.status_kehadiran && entry.status_kehadiran !== 'Hadir' ? (
                            <input
                              value={entry.keterangan || ''}
                              onChange={(event) => handleEntryChange(index, 'keterangan', event.target.value)}
                              placeholder="Keterangan opsional..."
                              className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                              aria-label={`Keterangan untuk ${siswa.nama_lengkap}`}
                              disabled={rowDisabled}
                            />
                          ) : (
                            <div className="flex min-h-11 items-center rounded-2xl border border-slate-100 bg-slate-50 px-3 text-sm font-semibold text-slate-400">
                              —
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </PremiumCard>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={processing || processingSave || !editable}
                onClick={handleSubmit}
                title={!editable ? 'Terkunci, bukan hari ini' : 'Simpan perubahan'}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingSave ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {processingSave ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4"
        >
          <button
            type="button"
            aria-label="Tutup modal"
            className="absolute inset-0"
            onClick={() => setConfirmOpen(false)}
          />

          <div className="animate-modal-pop relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 p-5 text-white">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Konfirmasi Simpan
                  </div>

                  <h3 className="mt-2 text-lg font-black leading-tight">
                    Simpan absensi mapel?
                  </h3>

                  <p className="mt-1 text-xs font-medium text-white/75">
                    Data akan disimpan untuk tanggal {formatDate(tanggal)}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={doSubmit} className="p-5">
              <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                    <TimerReset className="h-5 w-5" />
                  </div>

                  <p className="text-sm font-semibold leading-relaxed text-indigo-900">
                    Pastikan status kehadiran dan keterangan siswa sudah benar sebelum disimpan.
                  </p>
                </div>
              </div>

              {errors?.entries && (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    {Array.isArray(errors.entries)
                      ? errors.entries.join(', ')
                      : String(errors.entries)}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={processing || processingSave || !editable}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {processingSave ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {processingSave ? 'Menyimpan...' : 'Ya, Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </GuruLayout>
  );
}