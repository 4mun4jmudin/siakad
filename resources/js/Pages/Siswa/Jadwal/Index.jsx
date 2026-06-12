// resources/js/Pages/Siswa/Jadwal/Index.jsx

import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock3,
  GraduationCap,
  Info,
  Layers,
  Search,
  Sparkles,
  Timer,
  UserRound,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const clampStyle = (lines = 1) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
});

function formatTime(value) {
  if (!value) return '-';
  return String(value).slice(0, 5);
}

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'GR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getNamaKelas(siswa = {}) {
  const kelas = siswa?.kelas;

  if (kelas?.nama_kelas) return kelas.nama_kelas;
  if (kelas?.tingkat || kelas?.jurusan) return [kelas.tingkat, kelas.jurusan].filter(Boolean).join(' ');

  return siswa?.id_kelas ? `Kelas ${siswa.id_kelas}` : 'Kelas Siswa';
}

function getDayNameToday() {
  const mapping = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return mapping[new Date().getDay()];
}

function parseDaysOrder(pengaturan) {
  const fallback = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const source = pengaturan?.jadwal_hari;

  if (Array.isArray(source) && source.length > 0) return source;

  if (typeof source === 'string') {
    try {
      const parsed = JSON.parse(source);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      return source
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return fallback;
}

function getMapelName(pelajaran = {}) {
  return pelajaran?.mapel?.nama_mapel || pelajaran?.mata_pelajaran?.nama_mapel || pelajaran?.nama_mapel || 'Mata Pelajaran';
}

function getMapelKategori(pelajaran = {}) {
  return pelajaran?.mapel?.kategori || pelajaran?.mata_pelajaran?.kategori || pelajaran?.kategori || 'Umum';
}

function getGuruName(pelajaran = {}) {
  return pelajaran?.guru?.nama_lengkap || pelajaran?.nama_guru || 'Guru Pengampu';
}

function getCategoryTone(category = '') {
  const value = String(category).toLowerCase();

  if (value.includes('agama')) return 'amber';
  if (value.includes('matematika') || value.includes('ipa') || value.includes('sains')) return 'emerald';
  if (value.includes('bahasa')) return 'sky';
  if (value.includes('ips') || value.includes('sejarah') || value.includes('sosial')) return 'violet';
  if (value.includes('produktif') || value.includes('kejuruan')) return 'cyan';

  return 'slate';
}

function categoryClass(category) {
  const tone = getCategoryTone(category);

  const classes = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
  };

  return classes[tone] || classes.slate;
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

function DayChip({ active, isToday, day, total, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black transition-all duration-300',
        active
          ? 'border-cyan-500 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
          : isToday
            ? 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
            : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'
      )}
    >
      <span>{day}</span>

      {isToday && (
        <span className={cn('rounded-full px-2 py-0.5 text-[9px]', active ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-700')}>
          Hari ini
        </span>
      )}

      <span className={cn('rounded-full px-2 py-0.5 text-[9px]', active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
        {total}
      </span>
    </button>
  );
}

function SubjectBadge({ category }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide',
        categoryClass(category)
      )}
      style={clampStyle(1)}
    >
      {category || 'Umum'}
    </span>
  );
}

function ScheduleCard({ pelajaran, index = 0, compact = false }) {
  const mapelName = getMapelName(pelajaran);
  const category = getMapelKategori(pelajaran);
  const teacherName = getGuruName(pelajaran);
  const timeRange = `${formatTime(pelajaran.jam_mulai)} - ${formatTime(pelajaran.jam_selesai)}`;

  return (
    <PremiumCard className="group relative overflow-visible p-0" delay={index * 35}>
      <div className="relative overflow-hidden rounded-[2rem] p-4">
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-cyan-100/80 blur-2xl transition-all duration-500 group-hover:scale-125" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-sky-100/60 blur-2xl" />

        <div className="relative flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-200 transition group-hover:scale-105">
            {getInitials(teacherName)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <SubjectBadge category={category} />

              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                <Clock3 className="h-3.5 w-3.5" />
                {timeRange}
              </span>
            </div>

            <h3
              className={cn(
                'mt-3 font-black leading-tight text-slate-900 transition group-hover:text-cyan-700',
                compact ? 'text-base' : 'text-lg'
              )}
              style={clampStyle(2)}
              title={mapelName}
            >
              {mapelName}
            </h3>

            <p className="mt-2 flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-500">
              <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">
                {teacherName}
              </span>
            </p>

            {!compact && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Jam Mulai
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-slate-900">
                    {formatTime(pelajaran.jam_mulai)}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Jam Selesai
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-slate-900">
                    {formatTime(pelajaran.jam_selesai)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 rounded-2xl border border-slate-100 bg-white p-2 text-slate-300 transition group-hover:border-cyan-100 group-hover:bg-cyan-50 group-hover:text-cyan-600">
            <Info className="h-4 w-4" />
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}

function EmptyDay({ day }) {
  return (
    <PremiumCard className="p-8 text-center" delay={80}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
        <Clock3 className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-800">
        Tidak ada jadwal
      </h3>

      <p className="mt-2 text-sm font-medium text-slate-500">
        Hari {day} belum memiliki jadwal pelajaran.
      </p>
    </PremiumCard>
  );
}

function DaySection({
  hari,
  pelajaran,
  isToday,
  collapsed,
  onToggle,
  searchTerm,
}) {
  const filtered = pelajaran.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return true;

    return (
      getMapelName(item).toLowerCase().includes(keyword) ||
      getGuruName(item).toLowerCase().includes(keyword) ||
      getMapelKategori(item).toLowerCase().includes(keyword)
    );
  });

  return (
    <PremiumCard
      className={cn(
        'overflow-hidden p-0',
        isToday ? 'border-cyan-200 bg-cyan-50/40' : 'bg-white/90'
      )}
      delay={100}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 border-b border-slate-100 p-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
              isToday ? 'bg-cyan-600 text-white' : 'bg-slate-50 text-slate-600'
            )}
          >
            <CalendarDays className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cn('text-base font-black', isToday ? 'text-cyan-800' : 'text-slate-900')}>
                {hari}
              </h3>

              {isToday && (
                <span className="rounded-full bg-cyan-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                  Hari ini
                </span>
              )}
            </div>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              {filtered.length} dari {pelajaran.length} mata pelajaran
            </p>
          </div>
        </div>

        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition',
            collapsed
              ? 'border-slate-200 bg-white text-slate-500'
              : 'border-cyan-200 bg-cyan-50 text-cyan-700'
          )}
        >
          {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-3 p-4">
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <ScheduleCard
                key={item.id_jadwal || `${hari}-${index}`}
                pelajaran={item}
                index={index}
                compact
              />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-black text-slate-500">
                Tidak ada hasil pencarian
              </p>
            </div>
          )}
        </div>
      )}
    </PremiumCard>
  );
}

export default function JadwalIndex({
  auth,
  siswa = {},
  jadwalPelajaran = {},
  tahunAjaranAktif = null,
  pengaturan = null,
}) {
  const daysOrder = useMemo(() => parseDaysOrder(pengaturan), [pengaturan]);
  const todayName = useMemo(() => getDayNameToday(), []);

  const jadwalTersusun = useMemo(() => {
    return daysOrder.map((day) => ({
      hari: day,
      pelajaran: [...(jadwalPelajaran?.[day] || [])].sort((a, b) =>
        String(a.jam_mulai || '').localeCompare(String(b.jam_mulai || ''))
      ),
    }));
  }, [daysOrder, jadwalPelajaran]);

  const [activeDay, setActiveDay] = useState(
    daysOrder.includes(todayName) ? todayName : daysOrder[0]
  );

  const [searchTerm, setSearchTerm] = useState('');

  const [collapsed, setCollapsed] = useState(() => {
    return daysOrder.reduce((acc, day) => {
      acc[day] = day !== todayName;
      return acc;
    }, {});
  });

  const activeDayData = jadwalTersusun.find((item) => item.hari === activeDay);
  const todayData = jadwalTersusun.find((item) => item.hari === todayName);

  const totalMapel = jadwalTersusun.reduce((total, item) => total + item.pelajaran.length, 0);
  const totalHariAktif = jadwalTersusun.filter((item) => item.pelajaran.length > 0).length;
  const totalGuru = new Set(
    jadwalTersusun.flatMap((item) => item.pelajaran.map((pelajaran) => getGuruName(pelajaran)))
  ).size;

  const filteredActiveDay = (activeDayData?.pelajaran || []).filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return true;

    return (
      getMapelName(item).toLowerCase().includes(keyword) ||
      getGuruName(item).toLowerCase().includes(keyword) ||
      getMapelKategori(item).toLowerCase().includes(keyword)
    );
  });

  const toggleDay = (hari) => {
    setCollapsed((current) => ({
      ...current,
      [hari]: !current[hari],
    }));
  };

  return (
    <SiswaLayout
      user={auth?.user}
      header="Jadwal Pelajaran"
      subtitle="Pantau jadwal harian, guru pengampu, dan jam belajar."
      className="bg-slate-50 font-sans"
    >
      <Head title="Jadwal Pelajaran" />

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
                  Schedule Center
                </div>

                <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                  Jadwal Pelajaran
                </h1>

                <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-white/80">
                  Pantau jadwal kelas, mata pelajaran, guru pengampu, kategori mapel,
                  dan jam belajar dalam satu tampilan portal siswa.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {getNamaKelas(siswa)}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {tahunAjaranAktif?.tahun_ajaran || 'Tahun Ajaran'}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    <Layers className="h-3.5 w-3.5" />
                    {tahunAjaranAktif?.semester || 'Semester'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[560px]">
                <HeroStat label="Hari Ini" value={todayName} icon={CalendarDays} tone="cyan" />
                <HeroStat label="Mapel" value={totalMapel} icon={BookOpen} tone="sky" />
                <HeroStat label="Hari Aktif" value={totalHariAktif} icon={CheckCircle2} tone="emerald" />
                <HeroStat label="Guru" value={totalGuru} icon={UserRound} tone="amber" />
              </div>
            </div>
          </section>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard label="Total Mapel" value={totalMapel} icon={BookOpen} tone="cyan" hint="Dalam jadwal mingguan" />
            <MetricCard label="Hari Aktif" value={totalHariAktif} icon={CalendarDays} tone="sky" hint="Hari dengan jadwal" />
            <MetricCard label="Guru Pengampu" value={totalGuru} icon={UserRound} tone="amber" hint="Guru yang mengajar" />
            <MetricCard label="Jadwal Hari Ini" value={todayData?.pelajaran?.length || 0} icon={Timer} tone="emerald" hint={todayName} />
          </div>

          {/* Search + Day Chips */}
          <PremiumCard className="p-4 sm:p-5" delay={90}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Search className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Filter Jadwal
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Pilih hari atau cari mata pelajaran, guru, dan kategori mapel.
                  </p>
                </div>
              </div>

              <div className="relative w-full xl:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Cari mapel, guru, atau kategori..."
                  className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {jadwalTersusun.map((item) => (
                <DayChip
                  key={item.hari}
                  active={activeDay === item.hari}
                  isToday={item.hari === todayName}
                  day={item.hari}
                  total={item.pelajaran.length}
                  onClick={() => setActiveDay(item.hari)}
                />
              ))}
            </div>
          </PremiumCard>

          {/* Active Day */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="xl:col-span-8">
              <PremiumCard className="overflow-hidden p-0" delay={110}>
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                        <CalendarDays className="h-6 w-6" />
                      </div>

                      <div>
                        <h2 className="text-lg font-black text-slate-900">
                          Jadwal Hari {activeDay}
                        </h2>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {filteredActiveDay.length} mata pelajaran ditampilkan.
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                      <Clock3 className="h-4 w-4" />
                      {activeDay === todayName ? 'Hari Ini' : 'Hari Terpilih'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4 sm:p-6">
                  {filteredActiveDay.length > 0 ? (
                    filteredActiveDay.map((item, index) => (
                      <ScheduleCard
                        key={item.id_jadwal || `${activeDay}-${index}`}
                        pelajaran={item}
                        index={index}
                      />
                    ))
                  ) : (
                    <EmptyDay day={activeDay} />
                  )}
                </div>
              </PremiumCard>
            </section>

            <aside className="space-y-6 xl:col-span-4">
              <PremiumCard className="overflow-hidden p-0" delay={130}>
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                      <Timer className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        Ringkasan Hari Ini
                      </h2>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {todayName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  {(todayData?.pelajaran || []).length > 0 ? (
                    todayData.pelajaran.slice(0, 4).map((item, index) => (
                      <div
                        key={item.id_jadwal || `today-${index}`}
                        className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900" style={clampStyle(1)}>
                              {getMapelName(item)}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                              <Clock3 className="h-3.5 w-3.5" />
                              {formatTime(item.jam_mulai)} - {formatTime(item.jam_selesai)}
                            </p>
                          </div>

                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                      <Clock3 className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-black text-slate-500">
                        Tidak ada jadwal hari ini
                      </p>
                    </div>
                  )}
                </div>
              </PremiumCard>
            </aside>
          </div>

          {/* Weekly List */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Layers className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Jadwal Mingguan
                </h2>

                <p className="text-xs font-semibold text-slate-500">
                  Buka atau tutup jadwal per hari.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {jadwalTersusun.map((item) => (
                <DaySection
                  key={item.hari}
                  hari={item.hari}
                  pelajaran={item.pelajaran}
                  isToday={item.hari === todayName}
                  collapsed={collapsed[item.hari]}
                  onToggle={() => toggleDay(item.hari)}
                  searchTerm={searchTerm}
                />
              ))}
            </div>
          </section>
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
      `}</style>
    </SiswaLayout>
  );
}