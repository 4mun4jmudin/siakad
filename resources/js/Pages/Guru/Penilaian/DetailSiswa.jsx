// resources/js/Pages/Guru/Penilaian/DetailSiswa.jsx

import React, { useMemo, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
  ArrowLeft,
  Sparkles,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Target,
  Percent,
  Hash,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  FileText,
  UserRound,
  Layers,
  RefreshCw,
  Info,
  Award,
} from 'lucide-react';

/* =================== helpers =================== */
const cn = (...classes) => classes.filter(Boolean).join(' ');

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return NaN;

  const normalized = String(value).trim().replace(',', '.');
  const number = parseFloat(normalized);

  return Number.isFinite(number) ? number : NaN;
};

const fix2 = (value) => {
  const number = toNumber(value);
  return Number.isFinite(number) ? number.toFixed(2) : '—';
};

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

function isTruthy(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function formatDate(value) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function getScoreTone(score, kkm = 75) {
  const nilai = toNumber(score);
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

/* =================== UI Components =================== */
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

function InfoTile({ label, value, icon: Icon, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-50 text-slate-700',
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm',
            tones[tone] || tones.indigo
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <div className="mt-1 text-sm font-black leading-relaxed text-slate-800 break-words">
            {value ?? '—'}
          </div>
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

function StatusTuntasBadge({ tuntas }) {
  if (tuntas === null || tuntas === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500">
        <Info className="h-3.5 w-3.5" />
        Belum Final
      </span>
    );
  }

  const done = isTruthy(tuntas);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide',
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

function LockBanner({ locked }) {
  if (!locked) {
    return (
      <PremiumCard className="border-emerald-200 bg-emerald-50/90 p-4" delay={70}>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
            <Unlock className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-black text-emerald-800">
              Penilaian masih terbuka
            </p>

            <p className="mt-1 text-xs font-semibold leading-relaxed text-emerald-700">
              Guru masih dapat menambah, mengubah, atau menghapus rincian nilai siswa.
            </p>
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="border-rose-200 bg-rose-50/90 p-4" delay={70}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
          <Lock className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black text-rose-800">
            Penilaian Dikunci
          </p>

          <p className="mt-1 text-xs font-semibold leading-relaxed text-rose-700">
            Rincian nilai siswa ini telah dikunci oleh administrator. Penambahan, pengubahan, dan penghapusan nilai tidak dapat dilakukan.
          </p>
        </div>
      </div>
    </PremiumCard>
  );
}

function FormLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500"
    >
      {children}
    </label>
  );
}

function FormError({ message }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-xs font-semibold text-rose-600">
      {message}
    </p>
  );
}

function TextInputField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  step,
  error,
  className = '',
}) {
  return (
    <div className={className}>
      <FormLabel htmlFor={id}>{label}</FormLabel>

      <input
        id={id}
        type={type}
        step={step}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
        )}
      />

      <FormError message={error} />
    </div>
  );
}

function SelectField({ id, label, value, onChange, options = [], error, className = '' }) {
  return (
    <div className={className}>
      <FormLabel htmlFor={id}>{label}</FormLabel>

      <select
        id={id}
        value={value || ''}
        onChange={(event) => onChange(event.target.value || '')}
        className={cn(
          'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
        )}
      >
        <option value="">— Pilih —</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <FormError message={error} />
    </div>
  );
}

/* =================== Main Page =================== */
function NilaiDetailSiswa({
  header = {},
  details = [],
  komponenOptions = [],
}) {
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const kkm = toNumber(header?.kkm ?? 75);
  const isLocked = Boolean(header?.status_kunci);

  const rekap = useMemo(() => {
    const byName = {};

    for (const detail of details) {
      const componentName = detail.komponen_penilaian?.nama || '-';
      const nilai = toNumber(detail.nilai);

      if (!byName[componentName]) {
        byName[componentName] = { total: 0, count: 0 };
      }

      if (Number.isFinite(nilai)) {
        byName[componentName].total += nilai;
        byName[componentName].count += 1;
      }
    }

    return komponenOptions.map((komponen) => {
      const item = byName[komponen.nama];
      const rata = item && item.count ? item.total / item.count : null;

      return {
        komponen: komponen.nama,
        rata,
        jumlah: item?.count ?? 0,
      };
    });
  }, [details, komponenOptions]);

  const detailStats = useMemo(() => {
    const total = details.length;
    const tuntas = details.filter((item) => toNumber(item.nilai) >= kkm).length;
    const belumTuntas = details.filter((item) => {
      const nilai = toNumber(item.nilai);
      return Number.isFinite(nilai) && nilai < kkm;
    }).length;

    return { total, tuntas, belumTuntas };
  }, [details, kkm]);

  const {
    data,
    setData,
    post,
    processing,
    reset,
    errors,
  } = useForm({
    id_komponen: '',
    deskripsi: '',
    tanggal: '',
    nilai: '',
    bobot: '',
  });

  const editForm = useForm({
    id_komponen: '',
    deskripsi: '',
    tanggal: '',
    nilai: '',
    bobot: '',
  });

  const submit = (event) => {
    event.preventDefault();

    if (isLocked) return;

    post(safeRoute('guru.penilaian.detail.store', header.id_penilaian), {
      preserveScroll: true,
      onSuccess: () => reset('deskripsi', 'tanggal', 'nilai', 'bobot'),
    });
  };

  const askDeleteDetail = (detail) => {
    if (isLocked) return;
    setDeleteTarget(detail);
  };

  const closeDelete = () => {
    setDeleteTarget(null);
  };

  const submitDelete = (event) => {
    event.preventDefault();

    if (!deleteTarget || isLocked) return;

    router.delete(safeRoute('guru.penilaian.detail.destroy', deleteTarget.id_detail), {
      preserveScroll: true,
      onSuccess: () => closeDelete(),
    });
  };

  const startEdit = (detail) => {
    if (isLocked) return;

    setEditingId(detail.id_detail);

    editForm.setData({
      id_komponen: detail.id_komponen || '',
      deskripsi: detail.deskripsi || '',
      tanggal: detail.tanggal || '',
      nilai: detail.nilai ?? '',
      bobot: detail.bobot ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    editForm.reset();
  };

  const submitEdit = (event, idDetail) => {
    event.preventDefault();

    if (isLocked) return;

    editForm.put(safeRoute('guru.penilaian.detail.update', idDetail), {
      preserveScroll: true,
      onSuccess: () => {
        setEditingId(null);
        editForm.reset();
      },
    });
  };

  const komponenSelectOptions = komponenOptions.map((komponen) => ({
    value: komponen.id_komponen,
    label: komponen.nama,
  }));

  return (
    <>
      <Head title={`Detail Nilai - ${header?.nama_siswa || 'Siswa'}`} />

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
                    Detail Penilaian
                  </div>

                  <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                    Input Nilai Siswa
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                    Kelola rincian nilai siswa berdasarkan komponen penilaian, bobot lokal, dan target KKM.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {header?.nama_siswa || '-'}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      {header?.nama_mapel || '-'}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      KKM: {header?.kkm ?? 75}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                  <StatMiniCard label="Detail" value={detailStats.total} icon={ClipboardCheck} />
                  <StatMiniCard label="Tuntas" value={detailStats.tuntas} icon={CheckCircle2} />
                  <StatMiniCard label="Belum" value={detailStats.belumTuntas} icon={XCircle} />
                  <StatMiniCard label="Akhir" value={fix2(header?.nilai_akhir)} icon={Award} />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Back + Lock */}
          <PremiumCard className="p-3 sm:p-4" delay={50}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={safeRoute('guru.penilaian.showKelas', [header.id_kelas, header.id_mapel])}
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Daftar Siswa
              </Link>

              <div className="flex flex-wrap gap-2">
                <StatusTuntasBadge tuntas={header?.tuntas} />

                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide',
                    isLocked
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  )}
                >
                  {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                  {isLocked ? 'Dikunci' : 'Terbuka'}
                </span>
              </div>
            </div>
          </PremiumCard>

          <LockBanner locked={isLocked} />

          {/* Header Info */}
          <PremiumCard className="overflow-hidden" delay={90}>
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Detail Penilaian Akademik
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Informasi ringkas siswa, mata pelajaran, semester, nilai akhir, dan status ketuntasan.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
              <InfoTile label="Nama Siswa" value={header?.nama_siswa} icon={UserRound} tone="indigo" />
              <InfoTile label="Mata Pelajaran" value={header?.nama_mapel} icon={BookOpen} tone="sky" />
              <InfoTile label="Semester" value={header?.semester} icon={Layers} tone="violet" />
              <InfoTile label="KKM" value={header?.kkm ?? 75} icon={Target} tone="amber" />
              <InfoTile
                label="Nilai Akhir"
                value={<ScoreBadge value={header?.nilai_akhir} kkm={kkm} />}
                icon={Award}
                tone={toNumber(header?.nilai_akhir) >= kkm ? 'emerald' : 'rose'}
              />
              <InfoTile
                label="Status Kelulusan"
                value={<StatusTuntasBadge tuntas={header?.tuntas} />}
                icon={ShieldCheck}
                tone={isTruthy(header?.tuntas) ? 'emerald' : 'rose'}
              />
            </div>
          </PremiumCard>

          {/* Rekap */}
          <PremiumCard className="overflow-hidden" delay={120}>
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <BarChart3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Rekap Komponen Penilaian
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Rata-rata nilai setiap komponen penilaian berdasarkan detail yang sudah diinput.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">
              {rekap.map((item, index) => (
                <div
                  key={`${item.komponen}-${index}`}
                  className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900" style={clampStyle(2)}>
                        {item.komponen}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {item.jumlah} entri nilai
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Rata-rata
                    </span>

                    {item.rata !== null ? (
                      <ScoreBadge value={item.rata} kkm={kkm} />
                    ) : (
                      <span className="text-sm font-black text-slate-400">—</span>
                    )}
                  </div>
                </div>
              ))}

              {rekap.length === 0 && (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                  <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-black text-slate-600">
                    Belum ada komponen penilaian.
                  </p>
                </div>
              )}
            </div>
          </PremiumCard>

          {/* Detail Table */}
          <PremiumCard className="overflow-hidden" delay={150}>
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      Rincian Nilai Detail
                    </h2>

                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                      Daftar nilai detail siswa berdasarkan tanggal, komponen, deskripsi, nilai, dan bobot lokal.
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  <Hash className="h-4 w-4" />
                  {details.length} Data
                </span>
              </div>
            </div>

            {/* Mobile Card */}
            <div className="grid grid-cols-1 gap-3 p-4 lg:hidden">
              {details.length > 0 ? (
                details.map((detail, index) => (
                  <div
                    key={detail.id_detail}
                    className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    {editingId === detail.id_detail ? (
                      <form onSubmit={(event) => submitEdit(event, detail.id_detail)} className="space-y-3">
                        <SelectField
                          id={`edit-mobile-komponen-${detail.id_detail}`}
                          label="Komponen"
                          value={editForm.data.id_komponen}
                          onChange={(value) => editForm.setData('id_komponen', value)}
                          options={komponenSelectOptions}
                          error={editForm.errors.id_komponen}
                        />

                        <TextInputField
                          id={`edit-mobile-tanggal-${detail.id_detail}`}
                          type="date"
                          label="Tanggal"
                          value={editForm.data.tanggal}
                          onChange={(value) => editForm.setData('tanggal', value)}
                          error={editForm.errors.tanggal}
                        />

                        <TextInputField
                          id={`edit-mobile-deskripsi-${detail.id_detail}`}
                          label="Deskripsi"
                          value={editForm.data.deskripsi}
                          onChange={(value) => editForm.setData('deskripsi', value)}
                          error={editForm.errors.deskripsi}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <TextInputField
                            id={`edit-mobile-nilai-${detail.id_detail}`}
                            type="number"
                            step="0.01"
                            label="Nilai"
                            value={editForm.data.nilai}
                            onChange={(value) => editForm.setData('nilai', value)}
                            error={editForm.errors.nilai}
                          />

                          <TextInputField
                            id={`edit-mobile-bobot-${detail.id_detail}`}
                            type="number"
                            step="0.01"
                            label="Bobot"
                            value={editForm.data.bobot}
                            onChange={(value) => editForm.setData('bobot', value)}
                            error={editForm.errors.bobot}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700"
                          >
                            Batal
                          </button>

                          <button
                            type="submit"
                            disabled={editForm.processing}
                            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-black text-white disabled:opacity-70"
                          >
                            {editForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Simpan
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {detail.komponen_penilaian?.nama || 'Komponen'}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              {formatDate(detail.tanggal)}
                            </p>
                          </div>

                          <ScoreBadge value={detail.nilai} kkm={kkm} />
                        </div>

                        <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-600">
                          {detail.deskripsi || '—'}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                            <Percent className="h-3.5 w-3.5" />
                            Bobot: {detail.bobot == null || detail.bobot === '' ? '—' : `${fix2(detail.bobot)}%`}
                          </span>

                          {!isLocked && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(detail)}
                                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => askDeleteDetail(detail)}
                                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-black text-slate-600">
                    Belum ada rincian nilai.
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-black">Tanggal</th>
                    <th className="px-5 py-4 font-black">Komponen</th>
                    <th className="px-5 py-4 font-black">Deskripsi</th>
                    <th className="px-5 py-4 text-center font-black">Nilai</th>
                    <th className="px-5 py-4 text-center font-black">Bobot Lokal</th>
                    {!isLocked && <th className="px-5 py-4 text-right font-black">Aksi</th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {details.length ? (
                    details.map((detail) => (
                      editingId === detail.id_detail ? (
                        <tr key={detail.id_detail} className="bg-indigo-50/40">
                          <td className="px-5 py-4">
                            <input
                              type="date"
                              className="min-h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                              value={editForm.data.tanggal || ''}
                              onChange={(event) => editForm.setData('tanggal', event.target.value)}
                            />
                          </td>

                          <td className="px-5 py-4">
                            <select
                              className="min-h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                              value={editForm.data.id_komponen || ''}
                              onChange={(event) => editForm.setData('id_komponen', event.target.value || '')}
                            >
                              <option value="">— Pilih —</option>
                              {komponenOptions.map((komponen) => (
                                <option key={komponen.id_komponen} value={komponen.id_komponen}>
                                  {komponen.nama}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-5 py-4">
                            <input
                              type="text"
                              className="min-h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                              value={editForm.data.deskripsi}
                              onChange={(event) => editForm.setData('deskripsi', event.target.value)}
                              placeholder="Deskripsi"
                            />
                          </td>

                          <td className="px-5 py-4 text-center">
                            <input
                              type="number"
                              step="0.01"
                              className="min-h-10 w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                              value={editForm.data.nilai}
                              onChange={(event) => editForm.setData('nilai', event.target.value)}
                            />
                          </td>

                          <td className="px-5 py-4 text-center">
                            <input
                              type="number"
                              step="0.01"
                              className="min-h-10 w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                              value={editForm.data.bobot}
                              onChange={(event) => editForm.setData('bobot', event.target.value)}
                            />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:bg-slate-50"
                              >
                                Batal
                              </button>

                              <button
                                type="button"
                                onClick={(event) => submitEdit(event, detail.id_detail)}
                                disabled={editForm.processing}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-xs font-black text-white shadow-lg shadow-indigo-200 disabled:opacity-70"
                              >
                                {editForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Simpan
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={detail.id_detail} className="transition hover:bg-indigo-50/35">
                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black text-indigo-700">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(detail.tanggal)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-black text-slate-900" style={clampStyle(2)}>
                              {detail.komponen_penilaian?.nama || '—'}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-sm font-medium leading-relaxed text-slate-600" style={clampStyle(2)}>
                              {detail.deskripsi || '—'}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-center">
                            <ScoreBadge value={detail.nilai} kkm={kkm} />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700">
                              <Percent className="h-3.5 w-3.5" />
                              {detail.bobot == null || detail.bobot === '' ? '—' : `${fix2(detail.bobot)}%`}
                            </span>
                          </td>

                          {!isLocked && (
                            <td className="whitespace-nowrap px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(detail)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 transition hover:bg-indigo-100"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => askDeleteDetail(detail)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={isLocked ? 5 : 6}
                        className="px-6 py-14 text-center"
                      >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                          <FileText className="h-8 w-8" />
                        </div>

                        <p className="mt-3 text-sm font-black text-slate-600">
                          Belum ada rincian nilai terdaftar.
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Tambahkan rincian nilai baru melalui form di bawah.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PremiumCard>

          {/* Add Form */}
          {!isLocked && (
            <PremiumCard className="overflow-hidden" delay={180}>
              <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Plus className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      Tambah Rincian Nilai Baru
                    </h2>

                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                      Masukkan nilai baru sesuai komponen penilaian yang tersedia.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={submit} className="p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                  <SelectField
                    id="id_komponen"
                    label="Komponen"
                    value={data.id_komponen}
                    onChange={(value) => setData('id_komponen', value)}
                    options={komponenSelectOptions}
                    error={errors.id_komponen}
                    className="xl:col-span-1"
                  />

                  <TextInputField
                    id="tanggal"
                    type="date"
                    label="Tanggal"
                    value={data.tanggal}
                    onChange={(value) => setData('tanggal', value)}
                    error={errors.tanggal}
                    className="xl:col-span-1"
                  />

                  <TextInputField
                    id="deskripsi"
                    label="Keterangan / Topik"
                    placeholder="Mis: Ujian Bab 1"
                    value={data.deskripsi}
                    onChange={(value) => setData('deskripsi', value)}
                    error={errors.deskripsi}
                    className="md:col-span-2 xl:col-span-2"
                  />

                  <TextInputField
                    id="nilai"
                    type="number"
                    step="0.01"
                    label="Nilai"
                    placeholder="0 - 100"
                    value={data.nilai}
                    onChange={(value) => setData('nilai', value)}
                    error={errors.nilai}
                    className="xl:col-span-1"
                  />

                  <TextInputField
                    id="bobot"
                    type="number"
                    step="0.01"
                    label="Bobot"
                    placeholder="Mis: 10"
                    value={data.bobot}
                    onChange={(value) => setData('bobot', value)}
                    error={errors.bobot}
                    className="xl:col-span-1"
                  />
                </div>

                <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2 text-xs font-medium leading-relaxed text-slate-500">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                    Bobot lokal bersifat opsional, isi jika komponen nilai tersebut memiliki bobot khusus.
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {processing ? 'Menyimpan...' : 'Simpan Nilai'}
                  </button>
                </div>
              </form>
            </PremiumCard>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4">
          <div className="animate-modal-pop w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 to-pink-600 p-5 text-white">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-rose-50 backdrop-blur-md">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Konfirmasi Hapus
                  </div>

                  <h3 className="mt-2 text-lg font-black leading-tight">
                    Hapus rincian nilai?
                  </h3>

                  <p className="mt-1 text-xs font-medium text-white/75">
                    Data yang dihapus tidak dapat dikembalikan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDelete}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={submitDelete} className="p-5">
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold leading-relaxed text-rose-800">
                  Rincian nilai komponen{' '}
                  <strong>{deleteTarget?.komponen_penilaian?.nama || '-'}</strong>{' '}
                  dengan nilai{' '}
                  <strong>{fix2(deleteTarget?.nilai)}</strong>{' '}
                  akan dihapus permanen.
                </p>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDelete}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                >
                  <Trash2 className="h-4 w-4" />
                  Ya, Hapus
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
    </>
  );
}

/* layout */
NilaiDetailSiswa.layout = (page) => (
  <GuruLayout user={page.props.auth.user} header="Detail Nilai Siswa">
    {page}
  </GuruLayout>
);

export default NilaiDetailSiswa;