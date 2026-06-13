// resources/js/Pages/Guru/Absensi/SelectJadwal.jsx

import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
  Search,
  ChevronRight,
  Calendar,
  Sparkles,
  BookOpen,
  GraduationCap,
  Clock,
  Building2,
  Filter,
  RefreshCw,
  CheckCircle2,
  Timer,
  Info,
  XCircle,
  ClipboardCheck,
  CalendarDays,
  Users,
  MapPin,
  ArrowRight,
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

function fmtTime(value) {
  return value ? String(value).substring(0, 5) : '-';
}

function getKelasName(jadwal) {
  const kelas = jadwal?.kelas;

  if (!kelas) return 'Kelas tidak tersedia';
  if (kelas?.nama_kelas) return kelas.nama_kelas;

  return [kelas?.tingkat, kelas?.jurusan].filter(Boolean).join(' ') || 'Kelas tidak tersedia';
}

function getMapelName(jadwal) {
  return jadwal?.mata_pelajaran?.nama_mapel || jadwal?.mapel?.nama_mapel || 'Tanpa Mapel';
}

function makeDateFromTime(timeStr) {
  if (!timeStr) return null;

  const parts = String(timeStr).split(':').map((part) => parseInt(part, 10));
  const date = new Date();

  date.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);

  return date;
}

function getStatus(jadwal) {
  const now = new Date();
  const start = makeDateFromTime(jadwal?.jam_mulai);
  const end = makeDateFromTime(jadwal?.jam_selesai);

  if (!start || !end) {
    return {
      code: 'unknown',
      label: 'Waktu tidak lengkap',
      extra: '',
    };
  }

  if (now >= start && now <= end) {
    const minsLeft = Math.ceil((end - now) / 60000);

    return {
      code: 'ongoing',
      label: 'Sedang berlangsung',
      extra: `${minsLeft} menit tersisa`,
    };
  }

  if (now < start) {
    const minsTo = Math.ceil((start - now) / 60000);

    if (minsTo < 60) {
      return {
        code: 'upcoming',
        label: `Mulai ${minsTo} menit lagi`,
        extra: '',
      };
    }

    const hours = Math.floor(minsTo / 60);
    const mins = minsTo % 60;

    return {
      code: 'upcoming',
      label: `Mulai ${hours}j ${mins}m lagi`,
      extra: '',
    };
  }

  return {
    code: 'finished',
    label: 'Telah selesai',
    extra: '',
  };
}

function statusTone(code) {
  const map = {
    ongoing: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    upcoming: 'border-amber-200 bg-amber-50 text-amber-700',
    finished: 'border-slate-200 bg-slate-50 text-slate-600',
    unknown: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return map[code] || map.unknown;
}

function statusIcon(code) {
  const map = {
    ongoing: CheckCircle2,
    upcoming: Timer,
    finished: XCircle,
    unknown: Info,
  };

  return map[code] || Info;
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

function StatusBadge({ status }) {
  const Icon = statusIcon(status.code);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
        statusTone(status.code)
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {status.label}
    </span>
  );
}

function EmptyState({ resetFilters }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
        <CalendarDays className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-700">
        Tidak ada jadwal yang cocok
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Coba ubah kata kunci pencarian atau reset filter jadwal.
      </p>

      <button
        type="button"
        onClick={resetFilters}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
      >
        <RefreshCw className="h-4 w-4" />
        Reset Filter
      </button>
    </div>
  );
}

function JadwalCard({ jadwal, tanggal, index }) {
  const kelasName = getKelasName(jadwal);
  const mapelName = getMapelName(jadwal);
  const start = fmtTime(jadwal?.jam_mulai);
  const end = fmtTime(jadwal?.jam_selesai);
  const status = getStatus(jadwal);

  return (
    <PremiumCard className="group relative overflow-hidden p-0" delay={index * 45}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-100/80 blur-2xl transition-all duration-500 group-hover:scale-125" />
      <div className="pointer-events-none absolute -bottom-14 left-6 h-36 w-36 rounded-full bg-sky-100/70 blur-2xl" />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 transition-transform duration-300 group-hover:scale-105">
              <Calendar className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h3
                className="text-lg font-black leading-tight text-slate-900"
                style={clampStyle(2)}
                title={kelasName}
              >
                {kelasName}
              </h3>

              <p
                className="mt-1 text-sm font-bold leading-relaxed text-indigo-600"
                style={clampStyle(2)}
                title={mapelName}
              >
                {mapelName}
              </p>
            </div>
          </div>

          <StatusBadge status={status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Jam
            </div>

            <p className="mt-1 text-sm font-black text-slate-800">
              {start} — {end}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
              <Building2 className="h-3.5 w-3.5" />
              Ruang
            </div>

            <p className="mt-1 text-sm font-black text-slate-800">
              {jadwal?.ruang || '-'}
            </p>
          </div>
        </div>

        {status.extra && (
          <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
            {status.extra}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700">
            <GraduationCap className="h-3.5 w-3.5" />
            Kelas
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
            <BookOpen className="h-3.5 w-3.5" />
            Mapel
          </span>

          {jadwal?.ruang && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">
              <MapPin className="h-3.5 w-3.5" />
              {jadwal.ruang}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={safeRoute('guru.absensi-mapel.show', {
              id_jadwal: jadwal.id_jadwal,
              tanggal,
            })}
            className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
            title="Buka halaman absensi"
          >
            Buka Absensi
            <ChevronRight className="h-4 w-4" />
          </Link>

          {!jadwal.is_pengganti && (
            <Link
              href={safeRoute('guru.pengganti.ajukan', { id_jadwal: jadwal.id_jadwal, tanggal })}
              className="inline-flex min-h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-100"
              title="Ajukan Guru Pengganti"
            >
              <Users className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}

export default function SelectJadwal({
  auth,
  jadwalHariIni = [],
}) {
  const [q, setQ] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState('Semua');

  const today = new Date();

  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = useMemo(() => {
    const initial = {
      total: jadwalHariIni.length,
      ongoing: 0,
      upcoming: 0,
      finished: 0,
      unknown: 0,
    };

    jadwalHariIni.forEach((jadwal) => {
      const status = getStatus(jadwal);
      initial[status.code] = (initial[status.code] || 0) + 1;
    });

    return initial;
  }, [jadwalHariIni]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return jadwalHariIni.filter((jadwal) => {
      const kelasName = getKelasName(jadwal).toLowerCase();
      const mapelName = getMapelName(jadwal).toLowerCase();
      const jamMulai = jadwal?.jam_mulai || '';
      const jamSelesai = jadwal?.jam_selesai || '';
      const ruang = jadwal?.ruang || '';
      const status = getStatus(jadwal);

      const matchSearch =
        !term ||
        kelasName.includes(term) ||
        mapelName.includes(term) ||
        jamMulai.includes(term) ||
        jamSelesai.includes(term) ||
        ruang.toLowerCase().includes(term);

      const matchStatus =
        statusFilter === 'Semua' ||
        status.code === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [q, jadwalHariIni, statusFilter]);

  const resetFilters = () => {
    setQ('');
    setStatusFilter('Semua');
    setTanggal(new Date().toISOString().slice(0, 10));
  };

  return (
    <GuruLayout user={auth?.user} header="Pilih Jadwal Absensi">
      <Head title="Pilih Jadwal" />

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
                    Absensi Mapel
                  </div>

                  <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                    Pilih Jadwal untuk Absensi
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                    Pilih jadwal mengajar hari ini untuk membuka halaman absensi siswa per mata pelajaran.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {formattedDate}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {stats.total} Jadwal
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      Berlangsung: {stats.ongoing}
                    </span>

                    <Link
                      href={safeRoute('guru.akses-edit-absensi.index')}
                      className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-md hover:bg-white/30 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3" />
                      Pengajuan Akses Edit
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                  <StatMiniCard label="Total" value={stats.total} icon={CalendarDays} />
                  <StatMiniCard label="Berlangsung" value={stats.ongoing} icon={CheckCircle2} />
                  <StatMiniCard label="Akan Mulai" value={stats.upcoming} icon={Timer} />
                  <StatMiniCard label="Selesai" value={stats.finished} icon={XCircle} />
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
                    Cari Jadwal Mengajar
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Cari berdasarkan kelas, mata pelajaran, ruang, atau jam mengajar.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={{ code: 'ongoing', label: 'Berlangsung' }} />
                <StatusBadge status={{ code: 'upcoming', label: 'Akan Mulai' }} />
                <StatusBadge status={{ code: 'finished', label: 'Selesai' }} />
              </div>
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
                    onChange={(event) => setTanggal(event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="lg:col-span-6">
                <label htmlFor="search" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Pencarian
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="search"
                    type="search"
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Cari mata pelajaran, kelas, ruang, atau jam..."
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="Semua">Semua</option>
                  <option value="ongoing">Berlangsung</option>
                  <option value="upcoming">Akan Mulai</option>
                  <option value="finished">Selesai</option>
                  <option value="unknown">Tidak Lengkap</option>
                </select>
              </div>

              <div className="lg:col-span-1">
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Reset
                </label>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                  title="Reset filter"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </PremiumCard>

          {/* Content */}
          <PremiumCard className="p-4 sm:p-5" delay={120}>
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <ClipboardCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Jadwal Hari Ini
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Menampilkan {filtered.length} dari {jadwalHariIni.length} jadwal mengajar.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                <Users className="h-4 w-4" />
                Pilih salah satu jadwal
              </span>
            </div>

            {filtered.length === 0 ? (
              <EmptyState resetFilters={resetFilters} />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((jadwal, index) => (
                  <JadwalCard
                    key={jadwal.id_jadwal}
                    jadwal={jadwal}
                    tanggal={tanggal}
                    index={index}
                  />
                ))}
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
    </GuruLayout>
  );
}