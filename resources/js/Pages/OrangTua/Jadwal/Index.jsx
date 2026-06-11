// resources/js/Pages/OrangTua/JadwalIndex.jsx
import React, { useMemo, useState } from 'react';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { Head } from '@inertiajs/react';
import {
  Clock,
  Book,
  User,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  GraduationCap,
  Layers,
  Bell,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const fmtTime = (t) => (t ? t.slice(0, 5) : '-');

const clampStyle = (lines = 1) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
});

const initials = (name = '') => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const categoryHue = (name = '') => {
  if (!name) return 'bg-sky-50 text-sky-700 border-sky-200';

  const key = name.toLowerCase();

  if (key.includes('agama')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  if (key.includes('matematika') || key.includes('ipa') || key.includes('sains')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (key.includes('bahasa')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  if (key.includes('ips') || key.includes('sejarah') || key.includes('sosial')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return 'bg-sky-50 text-sky-700 border-sky-200';
};

const PremiumCard = ({ children, className = '', delay = 0 }) => (
  <div
    className={cn(
      'animate-soft-rise relative rounded-3xl border border-white/70 bg-white/85',
      'shadow-[0_20px_55px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl',
      'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-35px_rgba(15,23,42,0.55)]',
      className
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const EmptyDay = () => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-7 text-center">
    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
      <Clock className="h-5 w-5" />
    </div>

    <p className="mt-3 text-xs font-black text-slate-400">
      Tidak ada jadwal
    </p>

    <p className="mt-0.5 text-[10px] font-semibold text-slate-400/80">
      Hari bebas
    </p>
  </div>
);

const JadwalCompactCard = ({ pelajaran }) => {
  const { mapel, jam_mulai, jam_selesai, guru } = pelajaran;

  const teacherName = guru?.nama_lengkap || '—';
  const mapelKategori = mapel?.kategori || '';
  const mapelName = mapel?.nama_mapel || '-';
  const kelasName = pelajaran?.id_kelas ? `Kelas ${pelajaran.id_kelas}` : '';
  const jam = `${fmtTime(jam_mulai)} - ${fmtTime(jam_selesai)}`;

  return (
    <article
      className={cn(
        'group/item relative z-0 overflow-visible rounded-2xl border border-slate-100 bg-white/90 p-2.5 shadow-sm',
        'transition-all duration-300 hover:z-[120] hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/35 hover:shadow-md'
      )}
      aria-label={`${mapelName} pada ${jam}`}
      title={`${mapelName}\nGuru: ${teacherName}\nKategori: ${mapelKategori || 'Umum'}\n${kelasName}\nJam: ${jam}`}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 text-xs font-black text-emerald-700 shadow-sm ring-1 ring-emerald-100">
          {initials(teacherName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-1.5">
            <Book className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

            <p
              className="min-w-0 text-xs font-black leading-snug text-slate-900"
              style={clampStyle(2)}
            >
              {mapelName}
            </p>
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />

            <p className="text-[10px] font-bold leading-tight text-slate-500">
              {jam}
            </p>
          </div>

          <div className="mt-1 hidden 2xl:flex min-w-0 items-start gap-1.5">
            <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

            <p
              className="min-w-0 text-[10px] font-semibold leading-snug text-slate-500"
              style={clampStyle(1)}
            >
              {teacherName}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Info className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover/item:text-emerald-500" />
        </div>
      </div>

      <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex max-w-full rounded-full border px-2 py-0.5 text-[9px] font-black leading-tight',
            categoryHue(mapelKategori)
          )}
          style={clampStyle(1)}
        >
          {mapelKategori || 'Umum'}
        </span>

        {pelajaran?.id_kelas && (
          <span
            className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-black leading-tight text-slate-400"
            style={clampStyle(1)}
          >
            Kelas {pelajaran.id_kelas}
          </span>
        )}
      </div>

      {/* Detail lengkap saat hover */}
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-[9999] mt-2 hidden',
          'w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-3xl',
          'border border-white/70 bg-white/95 p-3 text-left shadow-2xl backdrop-blur-xl',
          'group-hover/item:block'
        )}
      >
        <div className="flex items-start gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Book className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black leading-snug text-slate-900 break-words">
              {mapelName}
            </p>

            <p className="mt-0.5 text-[10px] font-bold text-slate-400">
              {jam}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-slate-600">
          <p className="break-words">
            <span className="font-black text-slate-800">Guru:</span>{' '}
            {teacherName}
          </p>

          <p className="break-words">
            <span className="font-black text-slate-800">Kategori:</span>{' '}
            {mapelKategori || 'Umum'}
          </p>

          {pelajaran?.id_kelas && (
            <p className="break-words">
              <span className="font-black text-slate-800">Kelas:</span>{' '}
              {pelajaran.id_kelas}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default function JadwalIndex({ auth, siswa, jadwalPelajaran = {} }) {
  const daysOrder = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Minggu',
  ];

  const jadwalTersusun = daysOrder.map((day) => ({
    hari: day,
    pelajaran: (jadwalPelajaran[day] || []).sort((a, b) =>
      (a.jam_mulai || '').localeCompare(b.jam_mulai || '')
    ),
  }));

  const todayName = useMemo(() => {
    const date = new Date();
    const mapping = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ];

    return mapping[date.getDay()];
  }, []);

  const [collapsed, setCollapsed] = useState(
    daysOrder.reduce((acc, day) => ({ ...acc, [day]: day !== todayName }), {})
  );

  const toggle = (hari) => {
    setCollapsed((state) => ({ ...state, [hari]: !state[hari] }));
  };

  const namaSiswa = siswa?.nama_panggilan || siswa?.nama_lengkap || '';
  const kelasSiswa = siswa?.kelas
    ? ` — Kelas ${siswa.kelas.tingkat} ${siswa.kelas.jurusan || ''}`
    : '';

  const totalMapel = jadwalTersusun.reduce(
    (total, item) => total + item.pelajaran.length,
    0
  );

  const todaySchedule =
    jadwalTersusun.find((item) => item.hari === todayName)?.pelajaran || [];

  return (
    <OrangTuaLayout header={`Jadwal Pelajaran ${namaSiswa}${kelasSiswa}`}>
      <Head title="Jadwal Pelajaran" />

      <div className="relative min-h-screen overflow-visible bg-gradient-to-br from-slate-50 via-emerald-50/35 to-sky-50/60 py-5 sm:py-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl space-y-5 px-3 pb-10 sm:space-y-6 sm:px-6 lg:px-8">
          {/* Header / Banner */}
          <PremiumCard className="relative z-0 overflow-hidden p-0" delay={0}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-emerald-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4 sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/25 bg-white/15 text-white shadow-xl backdrop-blur-md sm:h-16 sm:w-16">
                    <CalendarDays className="h-7 w-7" />
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-50 backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5" />
                      Jadwal Belajar
                    </div>

                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                      Jadwal Pelajaran
                    </h1>

                    <p className="mt-2 max-w-4xl text-sm font-medium leading-relaxed text-white/80">
                      Jadwal ringkas per hari untuk{' '}
                      <span className="font-black text-emerald-100">
                        {namaSiswa || 'ananda'}
                      </span>
                      {siswa?.kelas && (
                        <>
                          {' '}kelas{' '}
                          <span className="font-black text-sky-100">
                            {siswa.kelas.tingkat} {siswa.kelas.jurusan || ''}
                          </span>
                        </>
                      )}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        Hari ini: {todayName}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        {todaySchedule.length} Mapel hari ini
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        Total {totalMapel} Mapel
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
                  <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
                    <GraduationCap className="mx-auto h-5 w-5 text-white/90" />
                    <p className="mt-2 text-2xl font-black leading-none">
                      {todaySchedule.length}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
                      Mapel Hari Ini
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
                    <Layers className="mx-auto h-5 w-5 text-white/90" />
                    <p className="mt-2 text-2xl font-black leading-none">
                      {totalMapel}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
                      Total Jadwal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Grid Jadwal Ringkas */}
          <div className="relative z-10 grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))] items-start gap-3 overflow-visible sm:gap-4">
            {jadwalTersusun.map(({ hari, pelajaran }, index) => {
              const isToday = hari === todayName;
              const isClosed = collapsed[hari];

              return (
                <PremiumCard
                  key={hari}
                  className={cn(
                    'relative z-0 min-w-0 overflow-visible p-3 hover:z-[100] focus-within:z-[100]',
                    isToday
                      ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-sky-50/35 ring-1 ring-emerald-200/70'
                      : 'bg-white/85'
                  )}
                  delay={80 + index * 40}
                >
                  <section className="relative z-0 min-w-0 overflow-visible">
                    <header className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <h2
                            className={cn(
                              'min-w-0 text-sm font-black leading-tight break-words',
                              isToday ? 'text-emerald-700' : 'text-slate-800'
                            )}
                          >
                            {hari}
                          </h2>

                          {isToday && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[9px] font-black text-white shadow-sm shadow-emerald-200">
                              <Bell className="h-3 w-3" />
                              Hari ini
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                          {pelajaran.length} Mapel
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggle(hari)}
                        aria-expanded={!isClosed}
                        className={cn(
                          'inline-flex shrink-0 items-center justify-center gap-1 rounded-2xl border px-2.5 py-1.5',
                          'text-[10px] font-black transition-all duration-300',
                          isClosed
                            ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        )}
                        title={isClosed ? 'Tampilkan Jadwal' : 'Sembunyikan Jadwal'}
                      >
                        <span>{isClosed ? 'Buka' : 'Tutup'}</span>

                        {isClosed ? (
                          <ChevronDown className="h-3 w-3 shrink-0" />
                        ) : (
                          <ChevronUp className="h-3 w-3 shrink-0" />
                        )}
                      </button>
                    </header>

                    <div className="mt-3 min-w-0 overflow-visible">
                      {pelajaran.length > 0 ? (
                        <div className="min-w-0 space-y-2 overflow-visible">
                          {!isClosed &&
                            pelajaran.map((item) => (
                              <JadwalCompactCard
                                key={item.id_jadwal}
                                pelajaran={item}
                              />
                            ))}

                          {isClosed && (
                            <button
                              type="button"
                              onClick={() => toggle(hari)}
                              className="w-full rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-5 text-center transition hover:border-emerald-200 hover:bg-emerald-50/60"
                            >
                              <p className="text-xs font-black text-slate-500">
                                Jadwal disembunyikan
                              </p>

                              <p className="mt-1 text-[10px] font-bold text-emerald-600">
                                Klik untuk melihat
                              </p>
                            </button>
                          )}
                        </div>
                      ) : (
                        <EmptyDay />
                      )}
                    </div>
                  </section>
                </PremiumCard>
              );
            })}
          </div>
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
    </OrangTuaLayout>
  );
}