// resources/js/Pages/Guru/Penilaian/RekapKelas.jsx

import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Info,
  Layers,
  RefreshCw,
  School,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';

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

function toNumber(value) {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined || value === '') return NaN;

  const parsed = parseFloat(String(value).trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function fix2(value) {
  const number = toNumber(value);
  return Number.isFinite(number) ? number.toFixed(2) : '—';
}

function isTuntas(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function getScoreTone(value, kkm = 75) {
  const nilai = toNumber(value);
  const target = toNumber(kkm);

  if (!Number.isFinite(nilai)) {
    return 'border-slate-200 bg-slate-50 text-slate-500';
  }

  if (nilai >= target) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (nilai >= target - 10) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-rose-200 bg-rose-50 text-rose-700';
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

      <p className="mt-2 text-xl font-black leading-none text-white sm:text-2xl">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black leading-none text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border',
            tones[tone] || tones.indigo
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ value, kkm }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-16 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-black',
        getScoreTone(value, kkm)
      )}
    >
      {fix2(value)}
    </span>
  );
}

function PredikatBadge({ predikat }) {
  return (
    <span className="inline-flex min-w-10 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">
      {predikat || '—'}
    </span>
  );
}

function StatusBadge({ tuntas }) {
  if (tuntas === null || tuntas === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
        <Info className="h-3.5 w-3.5" />
        Belum Ada
      </span>
    );
  }

  const done = isTuntas(tuntas);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
        done
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      )}
    >
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {done ? 'Tuntas' : 'Tidak Tuntas'}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
        <FileSpreadsheet className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-700">
        Tidak ada data rekap
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Tidak ada data siswa ditemukan untuk rekap nilai kelas ini.
      </p>
    </div>
  );
}

function RekapMobileCard({ siswa, index, kelas, mapel, komponenList = [] }) {
  const kkm = mapel?.kkm ?? 75;

  return (
    <PremiumCard className="group overflow-hidden p-0" delay={index * 35}>
      <div className="relative p-4">
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-100/70 blur-2xl transition-all duration-500 group-hover:scale-125" />

        <div className="relative flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <Users className="h-7 w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Link
                  href={safeRoute('guru.penilaian.showSiswa', [kelas.id_kelas, mapel.id_mapel, siswa.id_siswa])}
                  className="text-base font-black leading-snug text-slate-900 hover:text-indigo-700"
                  style={clampStyle(2)}
                >
                  {siswa.nama_lengkap || 'Nama Siswa'}
                </Link>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  NIS: {siswa.nis || '—'}
                </p>
              </div>

              <StatusBadge tuntas={siswa.tuntas} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <ScoreBadge value={siswa.nilai_akhir} kkm={kkm} />
              <PredikatBadge predikat={siswa.predikat} />
            </div>

            {komponenList.length > 0 && (
              <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Nilai Komponen
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {komponenList.map((komponen) => (
                    <div key={komponen} className="rounded-2xl bg-white px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400" style={clampStyle(1)}>
                        {komponen}
                      </p>

                      <p className="mt-1 text-sm font-black text-slate-700">
                        {siswa.komponen_nilai?.[komponen] != null ? fix2(siswa.komponen_nilai[komponen]) : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={safeRoute('guru.penilaian.showSiswa', [kelas.id_kelas, mapel.id_mapel, siswa.id_siswa])}
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
            >
              Detail Nilai
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

function PageRekapKelas({
  kelas = {},
  mapel = {},
  tahunAjaran,
  semester,
  siswaRekap = [],
  komponenList = [],
  statsKelas = {},
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const kkm = mapel?.kkm ?? 75;

  const calculatedStats = useMemo(() => {
    const total = siswaRekap.length;

    const nilaiValid = siswaRekap
      .map((siswa) => toNumber(siswa.nilai_akhir))
      .filter((nilai) => Number.isFinite(nilai));

    const tuntas = siswaRekap.filter((siswa) => isTuntas(siswa.tuntas)).length;

    const tidakTuntas = siswaRekap.filter(
      (siswa) => siswa.tuntas !== null && siswa.tuntas !== undefined && !isTuntas(siswa.tuntas)
    ).length;

    const sudahDinilai = nilaiValid.length;
    const belumDinilai = total - sudahDinilai;

    const rataRata = nilaiValid.length
      ? nilaiValid.reduce((sum, nilai) => sum + nilai, 0) / nilaiValid.length
      : null;

    const tertinggi = nilaiValid.length ? Math.max(...nilaiValid) : null;
    const terendah = nilaiValid.length ? Math.min(...nilaiValid) : null;

    return {
      total_siswa: statsKelas.total_siswa ?? total,
      sudah_dinilai: statsKelas.sudah_dinilai ?? sudahDinilai,
      belum_dinilai: statsKelas.belum_dinilai ?? belumDinilai,
      rata_rata: statsKelas.rata_rata ?? rataRata,
      nilai_tertinggi: statsKelas.nilai_tertinggi ?? tertinggi,
      nilai_terendah: statsKelas.nilai_terendah ?? terendah,
      tuntas: statsKelas.tuntas ?? tuntas,
      tidak_tuntas: statsKelas.tidak_tuntas ?? tidakTuntas,
    };
  }, [siswaRekap, statsKelas]);

  const filteredSiswa = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return siswaRekap.filter((siswa) => {
      const nama = String(siswa.nama_lengkap || '').toLowerCase();
      const nis = String(siswa.nis || '').toLowerCase();
      const predikat = String(siswa.predikat || '').toLowerCase();

      const matchSearch =
        !keyword ||
        nama.includes(keyword) ||
        nis.includes(keyword) ||
        predikat.includes(keyword);

      const matchStatus =
        statusFilter === 'Semua' ||
        (statusFilter === 'Tuntas' && isTuntas(siswa.tuntas)) ||
        (statusFilter === 'Tidak Tuntas' && siswa.tuntas !== null && siswa.tuntas !== undefined && !isTuntas(siswa.tuntas)) ||
        (statusFilter === 'Belum Dinilai' && (siswa.nilai_akhir === null || siswa.nilai_akhir === undefined));

      return matchSearch && matchStatus;
    });
  }, [siswaRekap, search, statusFilter]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Semua');
  };

  return (
    <>
      <Head title={`Rekap Nilai ${kelas?.nama_kelas || ''} - ${mapel?.nama_mapel || ''}`} />

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
                    Rekap Penilaian
                  </div>

                  <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                    Rekapitulasi Nilai Kelas
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                    Rekap nilai kelas{' '}
                    <span className="font-black text-indigo-100">
                      {kelas?.nama_kelas || '-'}
                    </span>{' '}
                    untuk mata pelajaran{' '}
                    <span className="font-black text-sky-100">
                      {mapel?.nama_mapel || '-'}
                    </span>{' '}
                    dengan KKM {mapel?.kkm ?? 75}.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {tahunAjaran || '-'}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      Semester {semester || '-'}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {calculatedStats.total_siswa} Siswa
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                  <StatMiniCard label="Siswa" value={calculatedStats.total_siswa} icon={Users} />
                  <StatMiniCard label="Dinilai" value={calculatedStats.sudah_dinilai} icon={ClipboardCheck} />
                  <StatMiniCard label="Rata-rata" value={fix2(calculatedStats.rata_rata)} icon={Award} />
                  <StatMiniCard label="Tuntas" value={calculatedStats.tuntas} icon={CheckCircle2} />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Action Bar */}
          <PremiumCard className="p-3 sm:p-4" delay={60}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Link
                href={safeRoute('guru.penilaian.showKelas', [kelas.id_kelas, mapel.id_mapel])}
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Daftar Siswa
              </Link>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  <GraduationCap className="h-4 w-4" />
                  {kelas?.nama_kelas || '-'}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                  <BookOpen className="h-4 w-4" />
                  {mapel?.nama_mapel || '-'}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                  <Target className="h-4 w-4" />
                  KKM {mapel?.kkm ?? 75}
                </span>
              </div>
            </div>
          </PremiumCard>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            <StatBox label="Total Siswa" value={calculatedStats.total_siswa} icon={Users} tone="slate" />
            <StatBox label="Sudah Dinilai" value={calculatedStats.sudah_dinilai} icon={ClipboardCheck} tone="indigo" />
            <StatBox label="Belum Dinilai" value={calculatedStats.belum_dinilai} icon={Info} tone="amber" />
            <StatBox label="Rata-rata" value={fix2(calculatedStats.rata_rata)} icon={Award} tone="sky" />
            <StatBox label="Tertinggi" value={fix2(calculatedStats.nilai_tertinggi)} icon={TrendingUp} tone="emerald" />
            <StatBox label="Terendah" value={fix2(calculatedStats.nilai_terendah)} icon={TrendingDown} tone="rose" />
            <StatBox label="Tuntas" value={calculatedStats.tuntas} icon={CheckCircle2} tone="emerald" />
            <StatBox label="Tidak Tuntas" value={calculatedStats.tidak_tuntas} icon={XCircle} tone="rose" />
          </div>

          {/* Filter */}
          <PremiumCard className="p-4 sm:p-5" delay={90}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Filter className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Tabel Rekap Nilai
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Cari siswa berdasarkan nama, NIS, atau predikat, lalu filter berdasarkan status nilai.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                  <School className="h-4 w-4" />
                  {tahunAjaran || '-'}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                  <Layers className="h-4 w-4" />
                  {semester || '-'}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  <CalendarDays className="h-4 w-4" />
                  {komponenList.length} Komponen
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <label htmlFor="search" className="sr-only">
                  Cari siswa
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama siswa, NIS, atau predikat..."
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Tuntas">Tuntas</option>
                  <option value="Tidak Tuntas">Tidak Tuntas</option>
                  <option value="Belum Dinilai">Belum Dinilai</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </PremiumCard>

          {/* Rekap */}
          <PremiumCard className="overflow-hidden" delay={120}>
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      Rekapitulasi Nilai Siswa
                    </h2>

                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                      Menampilkan {filteredSiswa.length} dari {siswaRekap.length} siswa.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatusBadge tuntas={true} />
                  <StatusBadge tuntas={false} />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                    <Info className="h-3.5 w-3.5" />
                    Belum Dinilai
                  </span>
                </div>
              </div>
            </div>

            {filteredSiswa.length > 0 ? (
              <>
                {/* Mobile */}
                <div className="grid grid-cols-1 gap-3 p-4 lg:hidden">
                  {filteredSiswa.map((siswa, index) => (
                    <RekapMobileCard
                      key={siswa.id_siswa}
                      siswa={siswa}
                      index={index}
                      kelas={kelas}
                      mapel={mapel}
                      komponenList={komponenList}
                    />
                  ))}
                </div>

                {/* Desktop */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="sticky left-0 z-20 min-w-[64px] bg-slate-50 px-4 py-4 font-black">
                          No
                        </th>

                        <th className="sticky left-[64px] z-20 min-w-[90px] bg-slate-50 px-4 py-4 font-black">
                          NIS
                        </th>

                        <th className="sticky left-[154px] z-20 min-w-[230px] bg-slate-50 px-4 py-4 font-black">
                          Nama Siswa
                        </th>

                        {komponenList.map((komponen) => (
                          <th
                            key={komponen}
                            className="min-w-[140px] px-4 py-4 text-center font-black"
                          >
                            {komponen}
                          </th>
                        ))}

                        <th className="min-w-[130px] bg-indigo-50/70 px-4 py-4 text-center font-black text-indigo-700">
                          Nilai Akhir
                        </th>

                        <th className="min-w-[100px] px-4 py-4 text-center font-black">
                          Predikat
                        </th>

                        <th className="min-w-[140px] px-4 py-4 text-center font-black">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredSiswa.map((siswa, index) => (
                        <tr
                          key={siswa.id_siswa}
                          className="transition hover:bg-indigo-50/35"
                        >
                          <td className="sticky left-0 z-10 bg-white px-4 py-4 font-black text-slate-400">
                            {index + 1}
                          </td>

                          <td className="sticky left-[64px] z-10 bg-white px-4 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-600">
                              <FileText className="h-3.5 w-3.5" />
                              {siswa.nis || '—'}
                            </span>
                          </td>

                          <td className="sticky left-[154px] z-10 bg-white px-4 py-4">
                            <Link
                              href={safeRoute('guru.penilaian.showSiswa', [kelas.id_kelas, mapel.id_mapel, siswa.id_siswa])}
                              className="font-black text-indigo-700 hover:underline"
                              style={clampStyle(2)}
                            >
                              {siswa.nama_lengkap || '—'}
                            </Link>
                          </td>

                          {komponenList.map((komponen) => (
                            <td key={komponen} className="px-4 py-4 text-center">
                              {siswa.komponen_nilai?.[komponen] != null ? (
                                <ScoreBadge
                                  value={siswa.komponen_nilai[komponen]}
                                  kkm={kkm}
                                />
                              ) : (
                                <span className="font-black text-slate-300">—</span>
                              )}
                            </td>
                          ))}

                          <td className="bg-indigo-50/30 px-4 py-4 text-center">
                            <ScoreBadge value={siswa.nilai_akhir} kkm={kkm} />
                          </td>

                          <td className="px-4 py-4 text-center">
                            <PredikatBadge predikat={siswa.predikat} />
                          </td>

                          <td className="px-4 py-4 text-center">
                            <StatusBadge tuntas={siswa.tuntas} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-4">
                <EmptyState />
              </div>
            )}
          </PremiumCard>
        </div>
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
      `}</style>
    </>
  );
}

PageRekapKelas.layout = (page) => (
  <GuruLayout user={page.props.auth.user} header="Rekap Nilai Kelas">
    {page}
  </GuruLayout>
);

export default PageRekapKelas;