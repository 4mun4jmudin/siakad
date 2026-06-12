// resources/js/Pages/Guru/Penilaian/Kelas.jsx

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
  FileText,
  Filter,
  GraduationCap,
  Info,
  Layers,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
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

  const parsed = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatNum(value) {
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

      <p className="mt-2 text-2xl font-black leading-none text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
        {label}
      </p>
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
      {formatNum(value)}
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
      {done ? 'Tuntas' : 'Belum Tuntas'}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
        <Users className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-700">
        Tidak ada data siswa
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Tidak ada data siswa ditemukan untuk kelas dan mata pelajaran ini.
      </p>
    </div>
  );
}

function SiswaCard({ siswa, kelas, mapel, index }) {
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
                <h3 className="text-base font-black leading-snug text-slate-900" style={clampStyle(2)}>
                  {siswa.nama_lengkap || 'Nama Siswa'}
                </h3>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  NIS: {siswa.nis || '—'}
                </p>
              </div>

              <StatusBadge tuntas={siswa.tuntas} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <ScoreBadge value={siswa.nilai_akhir} kkm={mapel?.kkm ?? 75} />
              <PredikatBadge predikat={siswa.predikat} />

              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                <Target className="h-3.5 w-3.5" />
                KKM {mapel?.kkm ?? 75}
              </span>
            </div>

            <Link
              href={safeRoute('guru.penilaian.showSiswa', [kelas.id_kelas, mapel.id_mapel, siswa.id_siswa])}
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
            >
              Input / Detail Nilai
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

function PagePenilaianKelas({
  kelas = {},
  mapel = {},
  tahunAjaran,
  semester,
  siswaList = [],
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const kkm = toNumber(mapel?.kkm ?? 75);

  const filteredSiswa = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return siswaList.filter((siswa) => {
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
        (statusFilter === 'Belum Tuntas' && siswa.tuntas !== null && siswa.tuntas !== undefined && !isTuntas(siswa.tuntas)) ||
        (statusFilter === 'Belum Ada' && (siswa.tuntas === null || siswa.tuntas === undefined));

      return matchSearch && matchStatus;
    });
  }, [siswaList, search, statusFilter]);

  const stats = useMemo(() => {
    const total = siswaList.length;
    const tuntas = siswaList.filter((siswa) => isTuntas(siswa.tuntas)).length;
    const belumTuntas = siswaList.filter(
      (siswa) => siswa.tuntas !== null && siswa.tuntas !== undefined && !isTuntas(siswa.tuntas)
    ).length;

    const nilaiValid = siswaList
      .map((siswa) => toNumber(siswa.nilai_akhir))
      .filter((nilai) => Number.isFinite(nilai));

    const rataRata = nilaiValid.length
      ? nilaiValid.reduce((sum, nilai) => sum + nilai, 0) / nilaiValid.length
      : null;

    return {
      total,
      tuntas,
      belumTuntas,
      belumAda: total - tuntas - belumTuntas,
      rataRata,
    };
  }, [siswaList]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Semua');
  };

  return (
    <>
      <Head title={`Penilaian Kelas ${kelas?.nama_kelas || ''}`} />

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
                    Penilaian Kelas
                  </div>

                  <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                    Penilaian {kelas?.nama_kelas || 'Kelas'}
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                    Mata pelajaran{' '}
                    <span className="font-black text-indigo-100">
                      {mapel?.nama_mapel || '-'}
                    </span>{' '}
                    dengan target KKM{' '}
                    <span className="font-black text-sky-100">
                      {mapel?.kkm ?? 75}
                    </span>{' '}
                    pada Tahun Ajaran {tahunAjaran || '-'} semester {semester || '-'}.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {stats.total} Siswa
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      Tuntas: {stats.tuntas}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      Rata-rata: {formatNum(stats.rataRata)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                  <StatMiniCard label="Siswa" value={stats.total} icon={Users} />
                  <StatMiniCard label="Tuntas" value={stats.tuntas} icon={CheckCircle2} />
                  <StatMiniCard label="Belum" value={stats.belumTuntas} icon={XCircle} />
                  <StatMiniCard label="Rata-rata" value={formatNum(stats.rataRata)} icon={Award} />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Action Bar */}
          <PremiumCard className="p-3 sm:p-4" delay={60}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Link
                href={safeRoute('guru.penilaian.index')}
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Daftar Kelas
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

                <Link
                  href={safeRoute('guru.penilaian.rekapKelas', [kelas.id_kelas, mapel.id_mapel])}
                  className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                >
                  <BarChart3 className="h-4 w-4" />
                  Rekap Kelas
                </Link>
              </div>
            </div>
          </PremiumCard>

          {/* Info + Filter */}
          <PremiumCard className="p-4 sm:p-5" delay={90}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Filter className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Daftar Nilai Siswa
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Cari siswa berdasarkan nama, NIS, atau predikat, lalu filter berdasarkan status ketuntasan.
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
                  <option value="Belum Tuntas">Belum Tuntas</option>
                  <option value="Belum Ada">Belum Ada Nilai</option>
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

          {/* Content */}
          <PremiumCard className="overflow-hidden" delay={120}>
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      Data Penilaian Siswa
                    </h2>

                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                      Menampilkan {filteredSiswa.length} dari {siswaList.length} siswa.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatusBadge tuntas={true} />
                  <StatusBadge tuntas={false} />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                    <Info className="h-3.5 w-3.5" />
                    Belum Ada
                  </span>
                </div>
              </div>
            </div>

            {filteredSiswa.length > 0 ? (
              <>
                {/* Mobile Card */}
                <div className="grid grid-cols-1 gap-3 p-4 lg:hidden">
                  {filteredSiswa.map((siswa, index) => (
                    <SiswaCard
                      key={siswa.id_siswa}
                      siswa={siswa}
                      kelas={kelas}
                      mapel={mapel}
                      index={index}
                    />
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-5 py-4 font-black">NIS</th>
                        <th className="px-5 py-4 font-black">Nama Siswa</th>
                        <th className="px-5 py-4 text-center font-black">Nilai Akhir</th>
                        <th className="px-5 py-4 text-center font-black">Predikat</th>
                        <th className="px-5 py-4 text-center font-black">Status</th>
                        <th className="px-5 py-4 text-right font-black">Aksi</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredSiswa.map((siswa) => (
                        <tr
                          key={siswa.id_siswa}
                          className="transition hover:bg-indigo-50/35"
                        >
                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-600">
                              <FileText className="h-3.5 w-3.5" />
                              {siswa.nis || '—'}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <Users className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-black text-slate-900" style={clampStyle(1)}>
                                  {siswa.nama_lengkap}
                                </p>

                                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                  ID Siswa: {siswa.id_siswa}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-center">
                            <ScoreBadge value={siswa.nilai_akhir} kkm={kkm} />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-center">
                            <PredikatBadge predikat={siswa.predikat} />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-center">
                            <StatusBadge tuntas={siswa.tuntas} />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <Link
                              href={safeRoute('guru.penilaian.showSiswa', [kelas.id_kelas, mapel.id_mapel, siswa.id_siswa])}
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-3.5 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
                            >
                              Input / Detail Nilai
                              <ArrowRight className="h-4 w-4" />
                            </Link>
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

PagePenilaianKelas.layout = (page) => (
  <GuruLayout user={page.props.auth.user} header="Penilaian Kelas">
    {page}
  </GuruLayout>
);

export default PagePenilaianKelas;