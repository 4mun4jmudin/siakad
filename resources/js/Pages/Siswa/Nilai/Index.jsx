// resources/js/Pages/Siswa/Nilai/Index.jsx

import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Layers,
  Lock,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Unlock,
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

function formatDate(value) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function displayValue(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
}

function getGradeTone(nilai, kkm = 75) {
  const grade = Number(nilai);
  const min = Number(kkm) || 75;

  if (!Number.isFinite(grade)) return 'slate';
  if (grade >= min) return 'emerald';
  if (grade >= min - 10) return 'amber';

  return 'rose';
}

function getPredikatTone(predikat) {
  const value = String(predikat || '').toUpperCase();

  if (['A', 'A+'].includes(value)) return 'emerald';
  if (['B', 'B+'].includes(value)) return 'cyan';
  if (['C', 'C+'].includes(value)) return 'amber';
  if (['D', 'E'].includes(value)) return 'rose';

  return 'slate';
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
        {displayValue(value)}
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
            {displayValue(value)}
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

function GradeComponentBadge({ type }) {
  const label = type || 'Lainnya';
  const value = String(type || '').trim().toLowerCase();

  let className = 'border-slate-200 bg-slate-50 text-slate-700';

  if (value.includes('tugas') || value.includes('harian') || value === 'uh') {
    className = 'border-sky-200 bg-sky-50 text-sky-700';
  } else if (value.includes('uts') || value === 'pts') {
    className = 'border-violet-200 bg-violet-50 text-violet-700';
  } else if (value.includes('uas') || value === 'pas') {
    className = 'border-cyan-200 bg-cyan-50 text-cyan-700';
  } else if (value.includes('praktik') || value.includes('praktek')) {
    className = 'border-amber-200 bg-amber-50 text-amber-700';
  } else if (value.includes('keaktifan') || value.includes('sikap')) {
    className = 'border-emerald-200 bg-emerald-50 text-emerald-700';
  } else if (value.includes('proyek') || value.includes('portofolio')) {
    className = 'border-rose-200 bg-rose-50 text-rose-700';
  }

  return (
    <span className={cn('inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide', className)}>
      {label}
    </span>
  );
}

function StatusBadge({ passed }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide',
        passed
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      )}
    >
      {passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {passed ? 'Tuntas' : 'Tidak Tuntas'}
    </span>
  );
}

function LockBadge({ locked }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide',
        locked
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      )}
    >
      {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
      {locked ? 'Terkunci' : 'Aktif'}
    </span>
  );
}

function PredikatBadge({ predikat }) {
  const tone = getPredikatTone(predikat);

  const tones = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
  };

  return (
    <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-black', tones[tone])}>
      {displayValue(predikat)}
    </span>
  );
}

function SemesterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-10 rounded-2xl px-4 py-2 text-xs font-black transition-all duration-300',
        active
          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function GlobalLockBanner() {
  return (
    <PremiumCard className="border-amber-100 bg-amber-50/90 p-4" delay={40}>
      <div className="flex items-start gap-3 text-amber-800">
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />

        <div>
          <p className="text-sm font-black">
            Pengisian Nilai Terkunci
          </p>

          <p className="mt-1 text-sm font-semibold leading-relaxed">
            Seluruh pengisian nilai dan jurnal akademik semester ini telah dikunci oleh sistem atau administrator.
            Nilai yang tampil bersifat resmi dan final.
          </p>
        </div>
      </div>
    </PremiumCard>
  );
}

function GradeSummaryPill({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900">
        {displayValue(value)}
      </p>
    </div>
  );
}

function DetailTable({ row }) {
  const groupedDetails = useMemo(() => {
    const details = Array.isArray(row?.details) ? row.details : [];

    return details.reduce((acc, detail) => {
      const componentName =
        detail?.komponen_penilaian?.nama ||
        detail?.komponen ||
        'Lainnya';

      if (!acc[componentName]) {
        acc[componentName] = {
          items: [],
          total: 0,
          count: 0,
        };
      }

      acc[componentName].items.push(detail);
      acc[componentName].total += Number(detail?.nilai) || 0;
      acc[componentName].count += 1;

      return acc;
    }, {});
  }, [row]);

  const groupEntries = Object.entries(groupedDetails);

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        Rincian Komponen Penilaian
      </p>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Deskripsi Kegiatan</th>
                <th className="px-5 py-3 text-right">Bobot</th>
                <th className="px-5 py-3 text-right">Nilai</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 font-medium">
              {groupEntries.length > 0 ? (
                groupEntries.map(([componentName, group]) => (
                  <React.Fragment key={componentName}>
                    <tr className="border-y border-slate-200 bg-slate-100/80">
                      <td colSpan="3" className="px-5 py-2.5 font-black text-slate-700">
                        <GradeComponentBadge type={componentName} />
                      </td>

                      <td className="bg-cyan-50/70 px-5 py-2.5 text-right font-black text-cyan-700">
                        Rata-rata: {Number((group.total / Math.max(group.count, 1)).toFixed(2))}
                      </td>
                    </tr>

                    {group.items.map((detail, index) => (
                      <tr
                        key={detail.id_detail || `${componentName}-${index}`}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-3 font-semibold text-slate-500">
                          {formatDate(detail.tanggal)}
                        </td>

                        <td className="px-5 py-3 font-bold text-slate-700">
                          {displayValue(detail.deskripsi)}
                        </td>

                        <td className="px-5 py-3 text-right font-bold text-slate-500">
                          {detail.bobot ? `${Math.round(Number(detail.bobot))}%` : '—'}
                        </td>

                        <td className="px-5 py-3 text-right font-black text-slate-900">
                          {displayValue(detail.nilai)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center font-semibold text-slate-400">
                    Belum ada rincian komponen penilaian yang dimasukkan guru untuk mata pelajaran ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RemedialBox({ remedials = [] }) {
  if (!Array.isArray(remedials) || remedials.length === 0) return null;

  return (
    <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-amber-700">
        <AlertTriangle className="h-4 w-4" />
        Informasi Remedial
      </p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-amber-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead className="border-b border-amber-100 bg-amber-50">
              <tr>
                <th className="px-4 py-2 text-left font-black text-amber-600">Jenis</th>
                <th className="px-4 py-2 text-left font-black text-amber-600">Tanggal</th>
                <th className="px-4 py-2 text-right font-black text-amber-600">Nilai Sebelum</th>
                <th className="px-4 py-2 text-right font-black text-amber-600">Nilai Remedial</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-amber-50">
              {remedials.map((remedial, index) => (
                <tr key={remedial.id_remedial || index}>
                  <td className="px-4 py-3 font-bold text-slate-700">
                    {remedial.jenis || 'Remedial'}
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-500">
                    {formatDate(remedial.tanggal)}
                  </td>

                  <td className="px-4 py-3 text-right font-bold text-slate-500">
                    {displayValue(remedial.nilai_sebelum)}
                  </td>

                  <td className="px-4 py-3 text-right font-black text-emerald-700">
                    {displayValue(remedial.nilai_remedial)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GradeItem({
  row,
  expanded,
  onToggle,
  isKunciJurnalGlobal,
}) {
  const mapelName = row?.mapel?.nama_mapel || 'Mata Pelajaran';
  const mapelKategori = row?.mapel?.kategori || 'Umum';
  const kkmVal = Number(row?.mapel?.kkm) || 75;
  const nilaiAkhir = row?.nilai_akhir;
  const hasPassed = Boolean(row?.tuntas);
  const locked = Boolean(row?.status_kunci || isKunciJurnalGlobal);
  const remedials = Array.isArray(row?.remedials) ? row.remedials : [];
  const hasRemedial = remedials.length > 0;
  const gradeTone = getGradeTone(nilaiAkhir, kkmVal);

  const gradeBoxClass = {
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
    slate: 'border-slate-100 bg-slate-50 text-slate-600',
  }[gradeTone];

  return (
    <PremiumCard
      className={cn(
        'overflow-hidden p-0',
        expanded ? 'border-cyan-200 bg-white' : 'bg-white/90'
      )}
      delay={0}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-4 p-5 text-left xl:flex-row xl:items-center xl:justify-between"
      >
        <div className="flex min-w-0 items-start gap-4">
          <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border text-lg font-black shadow-sm', gradeBoxClass)}>
            {nilaiAkhir ? Math.round(Number(nilaiAkhir)) : '—'}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-900">
              {mapelName}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                {mapelKategori}
              </span>

              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-700">
                KKM {kkmVal}
              </span>

              {hasRemedial && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Remedial
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 xl:w-auto xl:flex-nowrap xl:border-t-0 xl:pt-0">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <GradeSummaryPill label="Predikat" value={<PredikatBadge predikat={row?.predikat} />} />
            <GradeSummaryPill label="Nilai Akhir" value={displayValue(nilaiAkhir)} />
            <GradeSummaryPill label="Kelulusan" value={<StatusBadge passed={hasPassed} />} />
            <GradeSummaryPill label="Status" value={<LockBadge locked={locked} />} />
          </div>

          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-200',
              expanded
                ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100'
            )}
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-slate-100 bg-slate-50/50 p-5">
          {row?.catatan && (
            <div className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-4">
              <div className="flex items-start gap-3">
                <Bookmark className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-cyan-700">
                    Catatan / Rekomendasi Guru
                  </p>

                  <p className="mt-1 text-sm font-semibold italic leading-relaxed text-slate-600">
                    "{row.catatan}"
                  </p>
                </div>
              </div>
            </div>
          )}

          <DetailTable row={row} />

          <RemedialBox remedials={remedials} />
        </div>
      )}
    </PremiumCard>
  );
}

function EmptyState() {
  return (
    <PremiumCard className="p-10 text-center" delay={120}>
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 shadow-sm">
        <FileSpreadsheet className="h-10 w-10" />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-800">
        Hasil Pembelajaran Kosong
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
        Belum ada data nilai akademik yang diterbitkan pada semester ini.
      </p>
    </PremiumCard>
  );
}

export default function NilaiIndex({
  auth,
  siswa,
  penilaian = [],
  tahunAjarans = [],
  selectedTahunAjaranId,
  selectedSemester = 'Ganjil',
  isKunciJurnalGlobal = false,
  stats = {},
}) {
  const [expandedId, setExpandedId] = useState(null);

  const rows = Array.isArray(penilaian) ? penilaian : [];

  const computedStats = useMemo(() => {
    const totalMapel = stats?.total_mapel ?? rows.length;
    const mapelTuntas = stats?.mapel_tuntas ?? rows.filter((row) => row?.tuntas).length;
    const mapelTidakTuntas = stats?.mapel_tidak_tuntas ?? Math.max(Number(totalMapel) - Number(mapelTuntas), 0);

    const averageFromRows = rows.length > 0
      ? Math.round(
        rows.reduce((total, row) => total + toNumber(row?.nilai_akhir, 0), 0) / rows.length
      )
      : 0;

    return {
      rata_rata: stats?.rata_rata ?? averageFromRows,
      total_mapel: totalMapel,
      mapel_tuntas: mapelTuntas,
      mapel_tidak_tuntas: mapelTidakTuntas,
    };
  }, [rows, stats]);

  const activeTahunAjaran = tahunAjarans.find(
    (item) => String(item.id_tahun_ajaran) === String(selectedTahunAjaranId)
  );

  const toggleExpand = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleYearChange = (tahunId) => {
    router.get(
      safeRoute('siswa.nilai.index'),
      {
        id_tahun_ajaran: tahunId,
        semester: selectedSemester,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    );
  };

  const handleSemesterChange = (semester) => {
    router.get(
      safeRoute('siswa.nilai.index'),
      {
        id_tahun_ajaran: selectedTahunAjaranId,
        semester,
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
      header="Daftar Nilai Akademik"
      subtitle="Pantau nilai akhir, predikat, KKM, dan rincian komponen penilaian."
      className="bg-slate-50 font-sans"
    >
      <Head title="Lihat Nilai" />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/50 to-sky-50/70 pb-28 lg:pb-10">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-44 h-80 w-80 translate-x-24 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

        <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-6 lg:px-8 lg:py-6">
          {isKunciJurnalGlobal && <GlobalLockBanner />}

          {/* Hero */}
          <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 p-4 text-white shadow-[0_28px_90px_-55px_rgba(15,23,42,0.9)] sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 translate-y-12 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Academic Grade Center
                </div>

                <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                  Portal Nilai Akademik
                </h1>

                <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-white/80">
                  Evaluasi pencapaian hasil belajar pada setiap mata pelajaran,
                  lengkap dengan KKM, predikat, komponen nilai, dan informasi remedial.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {activeTahunAjaran?.tahun_ajaran || 'Tahun Ajaran'}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    <Layers className="h-3.5 w-3.5" />
                    Semester {selectedSemester}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {isKunciJurnalGlobal ? 'Final' : 'Aktif'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[560px]">
                <HeroStat label="Rata-Rata" value={computedStats.rata_rata} icon={FileSpreadsheet} tone="cyan" />
                <HeroStat label="Mapel" value={computedStats.total_mapel} icon={BookOpen} tone="sky" />
                <HeroStat label="Tuntas" value={computedStats.mapel_tuntas} icon={CheckCircle2} tone="emerald" />
                <HeroStat label="Belum" value={computedStats.mapel_tidak_tuntas} icon={XCircle} tone="rose" />
              </div>
            </div>
          </section>

          {/* Filters */}
          <PremiumCard className="p-4 sm:p-5" delay={80}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Filter className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Filter Nilai
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Pilih tahun ajaran dan semester untuk melihat nilai akademik.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex rounded-3xl border border-slate-200 bg-slate-950 p-1">
                  <SemesterButton
                    active={selectedSemester === 'Ganjil'}
                    onClick={() => handleSemesterChange('Ganjil')}
                  >
                    Semester Ganjil
                  </SemesterButton>

                  <SemesterButton
                    active={selectedSemester === 'Genap'}
                    onClick={() => handleSemesterChange('Genap')}
                  >
                    Semester Genap
                  </SemesterButton>
                </div>

                <select
                  value={selectedTahunAjaranId || ''}
                  onChange={(event) => handleYearChange(event.target.value)}
                  className="min-h-12 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                >
                  {tahunAjarans.map((tahun) => (
                    <option key={tahun.id_tahun_ajaran} value={tahun.id_tahun_ajaran}>
                      Tahun Ajaran {tahun.tahun_ajaran}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </PremiumCard>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard
              label="Rata-Rata Nilai"
              value={computedStats.rata_rata}
              hint="Akumulasi semua mapel"
              icon={TrendingUp}
              tone="cyan"
            />

            <MetricCard
              label="Total Mapel"
              value={computedStats.total_mapel}
              hint="Mapel yang diterbitkan"
              icon={BookOpen}
              tone="sky"
            />

            <MetricCard
              label="Mapel Tuntas"
              value={computedStats.mapel_tuntas}
              hint="Memenuhi KKM"
              icon={CheckCircle2}
              tone="emerald"
            />

            <MetricCard
              label="Tidak Tuntas"
              value={computedStats.mapel_tidak_tuntas}
              hint="Perlu perhatian"
              icon={XCircle}
              tone="rose"
            />
          </div>

          {/* Grade List */}
          <PremiumCard className="overflow-hidden p-0" delay={120}>
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <BookOpenCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Daftar Hasil Pembelajaran
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Klik salah satu mata pelajaran untuk melihat rincian nilai.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(null)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tutup Detail
                </button>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-6">
              {rows.length > 0 ? (
                rows.map((row, index) => {
                  const rowId = row.id_penilaian || index;

                  return (
                    <GradeItem
                      key={rowId}
                      row={row}
                      expanded={expandedId === rowId}
                      onToggle={() => toggleExpand(rowId)}
                      isKunciJurnalGlobal={isKunciJurnalGlobal}
                    />
                  );
                })
              ) : (
                <EmptyState />
              )}
            </div>
          </PremiumCard>
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