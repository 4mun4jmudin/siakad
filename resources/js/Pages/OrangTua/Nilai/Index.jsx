import React, { useState } from 'react';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { Head, router } from '@inertiajs/react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  BookOpenCheck,
  Bookmark,
  AlertTriangle,
  User,
  GraduationCap,
  Sparkles,
  Lock,
  Unlock,
  Trophy,
  TrendingUp,
  ClipboardList,
  Layers,
  Info,
  BarChart3,
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

const formatDate = (date) => {
  if (!date) return '—';

  try {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const groupDetailsByComponent = (details = []) => {
  return Object.entries(
    details.reduce((acc, detail) => {
      const componentName =
        detail.komponen_penilaian?.nama ||
        detail.komponen ||
        'Lainnya';

      if (!acc[componentName]) {
        acc[componentName] = {
          items: [],
          total: 0,
          count: 0,
        };
      }

      acc[componentName].items.push(detail);
      acc[componentName].total += Number(detail.nilai) || 0;
      acc[componentName].count += 1;

      return acc;
    }, {})
  );
};

const PremiumCard = ({ children, className = '', delay = 0 }) => (
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

const EmptyState = ({ icon: Icon = FileSpreadsheet, title, description }) => (
  <PremiumCard className="p-8 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 shadow-sm">
      <Icon className="h-7 w-7" />
    </div>

    <h3 className="mt-4 text-lg font-black text-slate-800">
      {title}
    </h3>

    <p className="mt-2 text-sm leading-relaxed text-slate-500">
      {description}
    </p>
  </PremiumCard>
);

const StatCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0 }) => (
  <PremiumCard className="group relative overflow-hidden p-4 sm:p-5" delay={delay}>
    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/80 blur-2xl transition-all duration-500 group-hover:scale-125" />

    <div className="relative flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <h3 className="mt-2 text-3xl font-black leading-none tracking-tight text-slate-900">
          {value}
        </h3>

        <p className="mt-2 text-xs font-semibold leading-snug text-slate-500" style={clampStyle(2)}>
          {subtitle}
        </p>
      </div>

      <div
        className={cn(
          'flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg',
          'transition-transform duration-300 group-hover:scale-105',
          gradient
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </PremiumCard>
);

const GradeComponentBadge = ({ type }) => {
  const value = String(type || '').trim();
  const t = value.toLowerCase();

  let colorClass = 'bg-slate-50 text-slate-700 border-slate-200';

  if (t.includes('tugas') || t.includes('harian') || t === 'uh') {
    colorClass = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (t.includes('uts') || t === 'pts') {
    colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (t.includes('uas') || t === 'pas') {
    colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (t.includes('praktik') || t.includes('praktek')) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (t.includes('keaktifan') || t.includes('sikap')) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (t.includes('proyek') || t.includes('portofolio')) {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full rounded-full border px-2.5 py-1',
        'text-[10px] font-black uppercase tracking-wide leading-tight',
        colorClass
      )}
      style={clampStyle(1)}
    >
      {value || 'Lainnya'}
    </span>
  );
};

const LockStatusBadge = ({ locked }) => {
  if (locked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700">
        <Lock className="h-3 w-3" />
        Final
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
      <Unlock className="h-3 w-3" />
      Proses
    </span>
  );
};

const PassBadge = ({ passed }) => {
  if (passed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Tuntas
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700">
      <XCircle className="h-3 w-3" />
      Tidak Tuntas
    </span>
  );
};

const ScoreCircle = ({ score, passed }) => (
  <div
    className={cn(
      'flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border text-base font-black shadow-sm',
      passed
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-rose-200 bg-rose-50 text-rose-700'
    )}
  >
    {score ? Math.round(score) : '—'}
  </div>
);

const MobileDetailCard = ({ detail }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-black leading-snug text-slate-800" style={clampStyle(2)}>
          {detail.deskripsi || '—'}
        </p>

        <p className="mt-1 text-[11px] font-semibold text-slate-400">
          {formatDate(detail.tanggal)}
        </p>
      </div>

      <div className="shrink-0 rounded-2xl bg-slate-50 px-3 py-2 text-center">
        <p className="text-[10px] font-black uppercase text-slate-400">
          Nilai
        </p>
        <p className="text-sm font-black text-slate-900">
          {detail.nilai ?? '—'}
        </p>
      </div>
    </div>

    <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
      <span>Bobot</span>
      <span>{detail.bobot ? `${Math.round(detail.bobot)}%` : '—'}</span>
    </div>
  </div>
);

const RemedialSection = ({ remedials = [] }) => {
  if (!remedials.length) return null;

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-amber-800">
            Informasi Remedial
          </p>

          <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-700/80">
            Data perbaikan nilai yang sudah tercatat oleh guru.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 md:hidden">
        {remedials.map((rem, idx) => (
          <div key={idx} className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-800">
                  {rem.jenis || 'Remedial'}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {formatDate(rem.tanggal)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Remedial
                </p>
                <p className="text-base font-black text-emerald-700">
                  {rem.nilai_remedial ?? '—'}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
              Nilai sebelum: {rem.nilai_sebelum ?? '—'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-amber-100 bg-white md:block">
        <table className="w-full text-xs">
          <thead className="border-b border-amber-100 bg-amber-50 text-amber-700">
            <tr>
              <th className="px-4 py-3 text-left font-black">Jenis</th>
              <th className="px-4 py-3 text-left font-black">Tanggal</th>
              <th className="px-4 py-3 text-right font-black">Nilai Sebelum</th>
              <th className="px-4 py-3 text-right font-black">Nilai Remedial</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-amber-50">
            {remedials.map((rem, idx) => (
              <tr key={idx} className="hover:bg-amber-50/40">
                <td className="px-4 py-3 font-bold text-slate-700">
                  {rem.jenis || 'Remedial'}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-500">
                  {formatDate(rem.tanggal)}
                </td>
                <td className="px-4 py-3 text-right font-black text-slate-500">
                  {rem.nilai_sebelum ?? '—'}
                </td>
                <td className="px-4 py-3 text-right font-black text-emerald-700">
                  {rem.nilai_remedial ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GradeDetails = ({ row }) => {
  const groupedDetails = groupDetailsByComponent(row.details || []);

  return (
    <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-4 sm:p-5">
      <div className="space-y-5">
        {row.catatan && (
          <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <Bookmark className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black text-indigo-700">
                  Catatan Guru Pengampu
                </p>

                <p className="mt-1 text-sm font-semibold italic leading-relaxed text-slate-600 break-words">
                  “{row.catatan}”
                </p>
              </div>
            </div>
          </div>
        )}

        <RemedialSection remedials={row.remedials || []} />

        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                <ClipboardList className="h-3.5 w-3.5" />
                Rincian Komponen
              </div>

              <h4 className="mt-2 text-base font-black text-slate-900">
                Detail Penilaian
              </h4>
            </div>

            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">
              {(row.details || []).length} data
            </span>
          </div>

          {groupedDetails.length > 0 ? (
            <div className="mt-4 space-y-4">
              {groupedDetails.map(([componentName, group]) => {
                const average = Number((group.total / group.count).toFixed(2));

                return (
                  <div key={componentName} className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/70">
                    <div className="flex flex-col gap-2 border-b border-slate-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                      <GradeComponentBadge type={componentName} />

                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                        Rata-rata: {average}
                      </span>
                    </div>

                    <div className="space-y-2 p-3 md:hidden">
                      {group.items.map((detail, index) => (
                        <MobileDetailCard
                          key={detail.id_detail || `${componentName}-${index}`}
                          detail={detail}
                        />
                      ))}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="px-5 py-3 font-black">Tanggal Penilaian</th>
                            <th className="px-5 py-3 font-black">Deskripsi</th>
                            <th className="px-5 py-3 text-right font-black">Bobot</th>
                            <th className="px-5 py-3 text-right font-black">Nilai</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                          {group.items.map((detail, index) => (
                            <tr
                              key={detail.id_detail || `${componentName}-${index}`}
                              className="transition hover:bg-emerald-50/30"
                            >
                              <td className="px-5 py-3 font-bold text-slate-500">
                                {formatDate(detail.tanggal)}
                              </td>

                              <td className="px-5 py-3 font-bold text-slate-700">
                                {detail.deskripsi || '—'}
                              </td>

                              <td className="px-5 py-3 text-right font-black text-slate-500">
                                {detail.bobot ? `${Math.round(detail.bobot)}%` : '—'}
                              </td>

                              <td className="px-5 py-3 text-right font-black text-slate-900">
                                {detail.nilai ?? '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-black text-slate-500">
                Belum ada rincian komponen
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Guru belum memasukkan detail komponen penilaian untuk mata pelajaran ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GradeCard = ({ row, isExpanded, onToggle, isKunciGlobal }) => {
  const passed = !!row.tuntas;
  const mapelName = row.mapel?.nama_mapel || 'Mata Pelajaran';
  const mapelKategori = row.mapel?.kategori || 'Umum';
  const kkmVal = Number(row.mapel?.kkm) || 75;
  const hasRemedial = row.remedials && row.remedials.length > 0;
  const locked = row.status_kunci || isKunciGlobal;

  return (
    <PremiumCard className="overflow-visible p-0">
      <div
        className={cn(
          'overflow-hidden rounded-3xl border transition-all duration-300',
          isExpanded
            ? 'border-emerald-200 bg-white shadow-md shadow-emerald-100/50'
            : 'border-white/70 bg-white/90 hover:border-emerald-100'
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="w-full p-4 text-left sm:p-5"
          aria-expanded={isExpanded}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3.5">
              <ScoreCircle score={row.nilai_akhir} passed={passed} />

              <div className="min-w-0">
                <h4
                  className="text-base font-black leading-snug text-slate-900"
                  style={clampStyle(2)}
                  title={mapelName}
                >
                  {mapelName}
                </h4>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                    {mapelKategori}
                  </span>

                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-400 shadow-sm ring-1 ring-slate-100">
                    KKM: {kkmVal}
                  </span>

                  {hasRemedial && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                      <AlertTriangle className="h-3 w-3" />
                      Remedial
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
                <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                  Status
                </p>
                <div className="mt-1 flex justify-center">
                  <LockStatusBadge locked={locked} />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
                <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                  Predikat
                </p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {row.predikat || '—'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
                <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                  Nilai
                </p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {row.nilai_akhir || '—'}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
                <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                  Kelulusan
                </p>
                <div className="mt-1 flex justify-center">
                  <PassBadge passed={passed} />
                </div>
              </div>
            </div>

            <div className="flex justify-end lg:justify-center">
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-300',
                  isExpanded
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-400'
                )}
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </span>
            </div>
          </div>
        </button>

        {isExpanded && <GradeDetails row={row} />}
      </div>
    </PremiumCard>
  );
};

export default function NilaiOrangTuaIndex({
  auth,
  siswa,
  penilaian = [],
  tahunAjarans = [],
  selectedTahunAjaranId,
  selectedSemester,
  isKunciGlobal,
  stats,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleYearChange = (tahunId) => {
    router.get(
      route('orangtua.nilai.index'),
      {
        id_tahun_ajaran: tahunId,
        semester: selectedSemester,
      },
      { preserveState: true }
    );
  };

  const handleSemesterChange = (semester) => {
    router.get(
      route('orangtua.nilai.index'),
      {
        id_tahun_ajaran: selectedTahunAjaranId,
        semester,
      },
      { preserveState: true }
    );
  };

  if (!siswa) {
    return (
      <OrangTuaLayout header="Nilai Anak">
        <Head title="Nilai Anak" />

        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/35 to-sky-50/60 py-12">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4">
            <EmptyState
              icon={User}
              title="Data Anak Belum Tersedia"
              description="Belum ada data siswa yang terhubung dengan akun Anda, atau belum ada anak yang dipilih."
            />
          </div>
        </div>
      </OrangTuaLayout>
    );
  }

  return (
    <OrangTuaLayout header="Nilai Akademik Anak">
      <Head title="Nilai Anak" />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/35 to-sky-50/60 py-5 sm:py-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
          {isKunciGlobal && (
            <PremiumCard className="border-amber-200 bg-amber-50/90 p-4" delay={0}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                  <Lock className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-amber-800">
                    Pengisian Nilai Terkunci
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-700/90">
                    Seluruh pengisian nilai dan jurnal akademik semester ini telah dikunci oleh sistem atau administrator. Nilai di bawah ini bersifat resmi dan final.
                  </p>
                </div>
              </div>
            </PremiumCard>
          )}

          {/* Hero Banner */}
          <PremiumCard className="relative overflow-hidden p-0" delay={80}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-emerald-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-4 sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/25 bg-white/15 text-white shadow-xl backdrop-blur-md sm:h-16 sm:w-16">
                    <GraduationCap className="h-7 w-7" />
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-50 backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5" />
                      Laporan Akademik
                    </div>

                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                      Nilai Akademik Ananda
                    </h1>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        {siswa.nama_lengkap}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        {siswa.kelas ? `${siswa.kelas.tingkat} ${siswa.kelas.jurusan}` : '—'}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        NIS: {siswa.nis || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                  <div className="flex rounded-3xl border border-white/15 bg-white/10 p-1 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => handleSemesterChange('Ganjil')}
                      className={cn(
                        'min-h-10 rounded-2xl px-4 py-2 text-xs font-black transition-all duration-300',
                        selectedSemester === 'Ganjil'
                          ? 'bg-white text-emerald-700 shadow-lg'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      Semester Ganjil
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSemesterChange('Genap')}
                      className={cn(
                        'min-h-10 rounded-2xl px-4 py-2 text-xs font-black transition-all duration-300',
                        selectedSemester === 'Genap'
                          ? 'bg-white text-emerald-700 shadow-lg'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      Semester Genap
                    </button>
                  </div>

                  <select
                    value={selectedTahunAjaranId || ''}
                    onChange={(event) => handleYearChange(event.target.value)}
                    className="min-h-12 rounded-3xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white shadow-sm backdrop-blur-md focus:border-white/40 focus:ring-2 focus:ring-white/20"
                  >
                    {tahunAjarans.map((ta) => (
                      <option
                        key={ta.id_tahun_ajaran}
                        value={ta.id_tahun_ajaran}
                        className="bg-white font-bold text-slate-800"
                      >
                        TA {ta.tahun_ajaran}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Rata-Rata Nilai"
              value={stats?.rata_rata ?? 0}
              subtitle="Akumulasi seluruh pelajaran"
              icon={FileSpreadsheet}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200"
              delay={120}
            />

            <StatCard
              title="Total Mapel"
              value={stats?.total_mapel ?? 0}
              subtitle="Mata pelajaran semester ini"
              icon={BookOpen}
              gradient="bg-gradient-to-br from-sky-500 to-cyan-500 shadow-sky-200"
              delay={160}
            />

            <StatCard
              title="Tuntas"
              value={stats?.mapel_tuntas ?? 0}
              subtitle="Memenuhi KKM kelulusan"
              icon={CheckCircle2}
              gradient="bg-gradient-to-br from-indigo-500 to-violet-500 shadow-indigo-200"
              delay={200}
            />

            <StatCard
              title="Tidak Tuntas"
              value={stats?.mapel_tidak_tuntas ?? 0}
              subtitle="Perlu perhatian dan pendampingan"
              icon={XCircle}
              gradient="bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-200"
              delay={240}
            />
          </div>

          {/* Grades List */}
          <PremiumCard className="p-4 sm:p-5" delay={280}>
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 text-emerald-600 shadow-sm">
                  <BookOpenCheck className="h-5 w-5" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                    <Layers className="h-3.5 w-3.5" />
                    Hasil Pembelajaran
                  </div>

                  <h2 className="mt-2 text-lg font-black text-slate-900">
                    Daftar Nilai Mata Pelajaran
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Klik salah satu mata pelajaran untuk melihat rincian komponen nilai, catatan guru, dan remedial.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {penilaian.length} Mapel
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  <Trophy className="h-3.5 w-3.5" />
                  Semester {selectedSemester}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {penilaian.map((row) => {
                const isExpanded = expandedId === row.id_penilaian;

                return (
                  <GradeCard
                    key={row.id_penilaian}
                    row={row}
                    isExpanded={isExpanded}
                    onToggle={() => toggleExpand(row.id_penilaian)}
                    isKunciGlobal={isKunciGlobal}
                  />
                );
              })}

              {penilaian.length === 0 && (
                <EmptyState
                  icon={FileSpreadsheet}
                  title="Hasil Pembelajaran Kosong"
                  description="Belum ada data nilai akademik yang diterbitkan pada semester ini untuk ananda."
                />
              )}
            </div>
          </PremiumCard>

          <PremiumCard className="p-4" delay={320}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Info className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">
                  Catatan untuk Orang Tua
                </p>

                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                  Nilai dapat berubah selama status masih proses. Nilai final adalah nilai yang sudah dikunci oleh guru atau administrator sekolah.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.55) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.45);
          border-radius: 999px;
        }

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