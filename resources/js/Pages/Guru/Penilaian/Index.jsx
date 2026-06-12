// resources/js/Pages/Guru/Penilaian/Index.jsx

import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
  Sparkles,
  ClipboardCheck,
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  Layers,
  School,
  FileText,
  Users,
  CalendarDays,
  ShieldCheck,
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

function EmptyState({ tahunAjaran, semester }) {
  return (
    <PremiumCard className="col-span-full p-8 text-center" delay={120}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 shadow-sm">
        <ClipboardCheck className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-700">
        Belum ada kelas atau mata pelajaran
      </h3>

      <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
        Belum ada jadwal kelas/mata pelajaran yang ditetapkan untuk Anda pada Tahun Ajaran{' '}
        <span className="font-black text-slate-700">{tahunAjaran || '-'}</span>{' '}
        semester{' '}
        <span className="font-black text-slate-700">{semester || '-'}</span>.
      </p>
    </PremiumCard>
  );
}

function KelasMapelCard({ item, index }) {
  return (
    <PremiumCard className="group relative overflow-hidden p-0" delay={index * 45}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-100/80 blur-2xl transition-all duration-500 group-hover:scale-125" />
      <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-sky-100/60 blur-2xl" />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 transition-transform duration-300 group-hover:scale-105">
              <ClipboardCheck className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h2
                className="text-lg font-black leading-tight text-slate-900"
                style={clampStyle(2)}
                title={item.nama_kelas}
              >
                {item.nama_kelas || 'Nama Kelas'}
              </h2>

              <p
                className="mt-1 text-sm font-bold leading-relaxed text-indigo-600"
                style={clampStyle(2)}
                title={item.nama_mapel}
              >
                {item.nama_mapel || 'Mata Pelajaran'}
              </p>
            </div>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700">
            <GraduationCap className="h-3.5 w-3.5" />
            Kelas
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
            <BookOpen className="h-3.5 w-3.5" />
            Mapel
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Aktif
          </span>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-black uppercase tracking-wide text-slate-400">
                ID Kelas
              </p>
              <p className="mt-1 font-black text-slate-700">
                {item.id_kelas || '-'}
              </p>
            </div>

            <div>
              <p className="font-black uppercase tracking-wide text-slate-400">
                ID Mapel
              </p>
              <p className="mt-1 font-black text-slate-700">
                {item.id_mapel || '-'}
              </p>
            </div>
          </div>
        </div>

        <Link
          href={safeRoute('guru.penilaian.showKelas', [item.id_kelas, item.id_mapel])}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
        >
          Kelola Penilaian
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </PremiumCard>
  );
}

function PagePenilaianIndex({
  kelasMapel = [],
  tahunAjaran,
  semester,
}) {
  const [search, setSearch] = useState('');
  const [mapelFilter, setMapelFilter] = useState('Semua');

  const mapelOptions = useMemo(() => {
    const values = kelasMapel
      .map((item) => item.nama_mapel)
      .filter(Boolean);

    return [...new Set(values)];
  }, [kelasMapel]);

  const filteredKelasMapel = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return kelasMapel.filter((item) => {
      const namaKelas = String(item.nama_kelas || '').toLowerCase();
      const namaMapel = String(item.nama_mapel || '').toLowerCase();

      const matchSearch =
        !keyword ||
        namaKelas.includes(keyword) ||
        namaMapel.includes(keyword);

      const matchMapel =
        mapelFilter === 'Semua' ||
        item.nama_mapel === mapelFilter;

      return matchSearch && matchMapel;
    });
  }, [kelasMapel, search, mapelFilter]);

  const totalKelas = useMemo(() => {
    const values = kelasMapel.map((item) => item.id_kelas || item.nama_kelas).filter(Boolean);
    return new Set(values).size;
  }, [kelasMapel]);

  const totalMapel = useMemo(() => {
    const values = kelasMapel.map((item) => item.id_mapel || item.nama_mapel).filter(Boolean);
    return new Set(values).size;
  }, [kelasMapel]);

  const resetFilters = () => {
    setSearch('');
    setMapelFilter('Semua');
  };

  return (
    <>
      <Head title="Penilaian Kelas" />

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
                    Modul Guru
                  </div>

                  <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                    Penilaian Siswa
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                    Pilih kelas dan mata pelajaran untuk menginput atau mengelola nilai siswa pada Tahun Ajaran{' '}
                    <span className="font-black text-indigo-100">
                      {tahunAjaran || '-'}
                    </span>{' '}
                    semester{' '}
                    <span className="font-black text-sky-100">
                      {semester || '-'}
                    </span>.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {kelasMapel.length} Data Penilaian
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {totalKelas} Kelas
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {totalMapel} Mata Pelajaran
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[430px]">
                  <StatMiniCard label="Data" value={kelasMapel.length} icon={ClipboardCheck} />
                  <StatMiniCard label="Kelas" value={totalKelas} icon={GraduationCap} />
                  <StatMiniCard label="Mapel" value={totalMapel} icon={BookOpen} />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Filter */}
          <PremiumCard className="p-4 sm:p-5" delay={80}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Filter className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Daftar Kelas & Mata Pelajaran
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Cari kelas atau mata pelajaran sebelum masuk ke halaman kelola nilai.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  <CalendarDays className="h-4 w-4" />
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
                  Cari kelas atau mata pelajaran
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari kelas atau mata pelajaran..."
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <select
                  value={mapelFilter}
                  onChange={(event) => setMapelFilter(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="Semua">Semua Mapel</option>
                  {mapelOptions.map((mapel) => (
                    <option key={mapel} value={mapel}>
                      {mapel}
                    </option>
                  ))}
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
          <PremiumCard className="p-4 sm:p-5" delay={120}>
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
                  <FileText className="h-3.5 w-3.5" />
                  Penilaian Akademik
                </div>

                <h3 className="mt-2 text-lg font-black text-slate-900">
                  Kelas Penilaian
                </h3>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Menampilkan {filteredKelasMapel.length} dari {kelasMapel.length} data kelas dan mata pelajaran.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                  <School className="h-4 w-4" />
                  Kelas
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                  <Users className="h-4 w-4" />
                  Siswa
                </span>
              </div>
            </div>

            {filteredKelasMapel.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredKelasMapel.map((item, index) => (
                  <KelasMapelCard
                    key={`${item.id_kelas}-${item.id_mapel}-${index}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState tahunAjaran={tahunAjaran} semester={semester} />
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

PagePenilaianIndex.layout = (page) => (
  <GuruLayout user={page.props.auth.user} header="Penilaian">
    {page}
  </GuruLayout>
);

export default PagePenilaianIndex;