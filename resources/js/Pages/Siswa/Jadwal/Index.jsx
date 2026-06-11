import React, { useMemo, useState } from 'react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Head } from '@inertiajs/react';
import {
  Clock,
  Book,
  User,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');

const fmtTime = (t) => (t ? t.slice(0, 5) : '-');

const clampStyle = (lines = 1) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word'
});

const initials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const categoryHue = (name = '') => {
  if (!name) return 'bg-sky-100/80 text-sky-800 border-sky-200/50';

  const k = name.toLowerCase();

  if (k.includes('agama')) {
    return 'bg-amber-100/80 text-amber-800 border-amber-200/50';
  }

  if (k.includes('matematika') || k.includes('ipa') || k.includes('sains')) {
    return 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50';
  }

  if (k.includes('bahasa')) {
    return 'bg-indigo-100/80 text-indigo-800 border-indigo-200/50';
  }

  if (k.includes('ips') || k.includes('sejarah') || k.includes('sosial')) {
    return 'bg-purple-100/80 text-purple-800 border-purple-200/50';
  }

  return 'bg-sky-100/80 text-sky-800 border-sky-200/50';
};

const JadwalCompactCard = ({ pelajaran }) => {
  const { mapel, jam_mulai, jam_selesai, guru } = pelajaran;

  const teacherName = guru?.nama_lengkap || '—';
  const mapelKategori = mapel?.kategori || '';
  const mapelName = mapel?.nama_mapel || '-';
  const jam = `${fmtTime(jam_mulai)} - ${fmtTime(jam_selesai)}`;

  return (
    <article
      className={cn(
        'group/item relative rounded-xl border border-slate-100 bg-white/80 p-2.5 shadow-sm',
        'transition-all duration-200 hover:border-sky-200 hover:bg-sky-50/30 hover:shadow-md',
        'overflow-visible'
      )}
      aria-label={`${mapelName} pada ${jam}`}
      title={`${mapelName}\nGuru: ${teacherName}\nKategori: ${mapelKategori || 'Umum'}\nJam: ${jam}`}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 text-xs font-bold text-slate-700">
          {initials(teacherName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-1.5">
            <Book className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />

            <p
              className="min-w-0 text-xs font-bold leading-snug text-slate-800"
              style={clampStyle(2)}
            >
              {mapelName}
            </p>
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />

            <p className="text-[10px] font-semibold leading-tight text-slate-500">
              {jam}
            </p>
          </div>

          <div className="mt-1 hidden 2xl:flex min-w-0 items-start gap-1.5">
            <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

            <p
              className="min-w-0 text-[10px] font-medium leading-snug text-slate-500"
              style={clampStyle(1)}
            >
              {teacherName}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Info className="h-3.5 w-3.5 text-slate-300 group-hover/item:text-sky-500" />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex max-w-full rounded-full border px-2 py-0.5 text-[9px] font-bold leading-tight',
            categoryHue(mapelKategori)
          )}
          style={clampStyle(1)}
        >
          {mapelKategori || 'Umum'}
        </span>
      </div>

      {/* Detail lengkap saat hover */}
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden',
          'w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-2xl',
          'group-hover/item:block'
        )}
      >
        <p className="text-xs font-bold leading-snug text-slate-900 break-words">
          {mapelName}
        </p>

        <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-slate-600">
          <p className="break-words">
            <span className="font-semibold text-slate-800">Guru:</span>{' '}
            {teacherName}
          </p>

          <p className="break-words">
            <span className="font-semibold text-slate-800">Kategori:</span>{' '}
            {mapelKategori || 'Umum'}
          </p>

          <p>
            <span className="font-semibold text-slate-800">Jam:</span>{' '}
            {jam}
          </p>
        </div>
      </div>
    </article>
  );
};

export default function JadwalIndex({
  auth,
  siswa,
  jadwalPelajaran = {},
  tahunAjaranAktif,
  pengaturan
}) {
  const daysOrder = pengaturan?.jadwal_hari || [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu'
  ];

  const jadwalTersusun = daysOrder.map((day) => ({
    hari: day,
    pelajaran: (jadwalPelajaran[day] || []).sort((a, b) =>
      (a.jam_mulai || '').localeCompare(b.jam_mulai || '')
    ),
  }));

  const todayName = useMemo(() => {
    const d = new Date();
    const mapping = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu'
    ];

    return mapping[d.getDay()];
  }, []);

  const [collapsed, setCollapsed] = useState(
    daysOrder.reduce((acc, d) => ({ ...acc, [d]: d !== todayName }), {})
  );

  const toggle = (hari) => {
    setCollapsed((s) => ({ ...s, [hari]: !s[hari] }));
  };

  return (
    <SiswaLayout header="Jadwal Pelajaran">
      <Head title="Jadwal Pelajaran" />

      <div className="mx-auto w-full max-w-7xl space-y-4 overflow-x-hidden px-3 pb-10 sm:px-4 lg:px-6">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 text-white shadow-xl sm:p-5 md:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 translate-x-12 -translate-y-12 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-36 w-36 translate-y-12 rounded-full bg-indigo-500/10 blur-2xl" />

          <div className="relative flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sky-400 shadow-inner backdrop-blur-md sm:h-12 sm:w-12">
                <CalendarDays className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight tracking-tight break-words sm:text-xl">
                  Jadwal Pelajaran
                </h2>

                <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-300 break-words sm:text-sm">
                  Kelas{' '}
                  <span className="font-bold text-sky-400">
                    {siswa?.id_kelas || '—'}
                  </span>{' '}
                  Tahun Ajaran{' '}
                  <span className="font-bold text-indigo-300">
                    {tahunAjaranAktif?.tahun_ajaran || '—'}
                  </span>{' '}
                  ({tahunAjaranAktif?.semester || '—'})
                </p>
              </div>
            </div>

            <div className="flex w-fit min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
              <span className="text-xs font-medium text-slate-400">
                Hari Ini:
              </span>

              <span className="rounded-xl bg-sky-500 px-3 py-1 text-xs font-bold text-white shadow-md shadow-sky-500/20">
                {todayName}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Compact Grid */}
        <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))] items-start gap-3 sm:gap-4">
          {jadwalTersusun.map(({ hari, pelajaran }) => {
            const isToday = hari === todayName;

            return (
              <section
                key={hari}
                className={cn(
                  'relative min-w-0 overflow-visible rounded-2xl border p-3 shadow-sm transition-all duration-300',
                  isToday
                    ? 'border-sky-200 bg-gradient-to-b from-sky-50/60 to-indigo-50/20 shadow-sky-100/50 ring-1 ring-sky-200/50'
                    : 'border-slate-100 bg-white'
                )}
              >
                <header className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3
                        className={cn(
                          'min-w-0 text-sm font-bold leading-tight break-words',
                          isToday ? 'text-sky-700' : 'text-slate-800'
                        )}
                      >
                        {hari}
                      </h3>

                      {isToday && (
                        <span className="shrink-0 rounded-full bg-sky-500 px-2 py-0.5 text-[9px] font-bold text-white">
                          Hari ini
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                      {pelajaran.length} Mapel
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(hari)}
                    className={cn(
                      'inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition-all duration-200',
                      collapsed[hari]
                        ? 'border-slate-200/60 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        : 'border-sky-200/60 bg-sky-50 text-sky-700 hover:bg-sky-100'
                    )}
                    title={collapsed[hari] ? 'Tampilkan Jadwal' : 'Sembunyikan Jadwal'}
                  >
                    <span>{collapsed[hari] ? 'Buka' : 'Tutup'}</span>

                    {collapsed[hari] ? (
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    ) : (
                      <ChevronUp className="h-3 w-3 shrink-0" />
                    )}
                  </button>
                </header>

                <div className="mt-3 min-w-0">
                  {pelajaran.length > 0 ? (
                    <div className="min-w-0 space-y-2">
                      {!collapsed[hari] &&
                        pelajaran.map((p) => (
                          <JadwalCompactCard
                            key={p.id_jadwal}
                            pelajaran={p}
                          />
                        ))}

                      {collapsed[hari] && (
                        <button
                          type="button"
                          onClick={() => toggle(hari)}
                          className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center transition hover:border-sky-200 hover:bg-sky-50"
                        >
                          <p className="text-xs font-bold text-slate-500">
                            Jadwal disembunyikan
                          </p>

                          <p className="mt-1 text-[10px] font-semibold text-sky-600">
                            Klik untuk melihat
                          </p>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-3 py-6 text-center">
                      <Clock className="mx-auto mb-2 h-6 w-6 text-slate-300" />

                      <p className="text-xs font-bold text-slate-400">
                        Tidak ada jadwal
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400/80">
                        Hari bebas
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </SiswaLayout>
  );
}