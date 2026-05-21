import React, { useMemo, useState } from 'react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Head } from '@inertiajs/react';
import { Clock, Book, User, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';

const cn = (...c) => c.filter(Boolean).join(' ');
const fmtTime = (t) => (t ? t.slice(0, 5) : '-');

const initials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const JadwalCard = ({ pelajaran }) => {
  const { mapel, jam_mulai, jam_selesai, guru } = pelajaran;
  const teacherName = guru?.nama_lengkap || '—';
  const mapelKategori = mapel?.kategori || '';

  const categoryHue = (name = '') => {
    if (!name) return 'bg-sky-100/80 text-sky-800 border-sky-200/50';
    const k = name.toLowerCase();
    if (k.includes('agama')) return 'bg-amber-100/80 text-amber-800 border-amber-200/50';
    if (k.includes('matematika') || k.includes('ipa') || k.includes('sains')) return 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50';
    if (k.includes('bahasa')) return 'bg-indigo-100/80 text-indigo-800 border-indigo-200/50';
    if (k.includes('ips') || k.includes('sejarah') || k.includes('sosial')) return 'bg-purple-100/80 text-purple-800 border-purple-200/50';
    return 'bg-sky-100/80 text-sky-800 border-sky-200/50';
  };

  return (
    <article
      className="group relative flex items-start gap-4 p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200/60 transition-all duration-300"
      aria-label={`${mapel?.nama_mapel || 'Mata Pelajaran'} pada ${fmtTime(jam_mulai)} - ${fmtTime(jam_selesai)}`}
    >
      <div className="flex-shrink-0">
        <div className="h-14 w-1.5 rounded-full bg-gradient-to-b from-sky-400 to-indigo-600 group-hover:from-sky-500 group-hover:to-indigo-700 transition-all duration-300" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              {initials(teacherName)}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <Book className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <span className="truncate">{mapel?.nama_mapel || '-'}</span>
              </h4>
              <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{teacherName}</span>
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Durasi</span>
            <div className="text-xs font-semibold text-slate-700 mt-0.5 bg-slate-100/75 px-2 py-0.5 rounded-md border border-slate-200/30">{fmtTime(jam_mulai)} — {fmtTime(jam_selesai)}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-50 pt-2">
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', categoryHue(mapelKategori))}>
            {mapelKategori || 'Umum'}
          </span>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{fmtTime(jam_mulai)} - {fmtTime(jam_selesai)}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default function JadwalIndex({ auth, siswa, jadwalPelajaran = {}, tahunAjaranAktif }) {
  const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  
  const jadwalTersusun = daysOrder.map(day => ({
    hari: day,
    pelajaran: (jadwalPelajaran[day] || []).sort((a, b) => (a.jam_mulai || '').localeCompare(b.jam_mulai || ''))
  }));

  const todayName = useMemo(() => {
    const d = new Date();
    const mapping = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return mapping[d.getDay()];
  }, []);

  const [collapsed, setCollapsed] = useState(
    daysOrder.reduce((acc, d) => ({ ...acc, [d]: d !== todayName }), {})
  );

  const toggle = (hari) => setCollapsed(s => ({ ...s, [hari]: !s[hari] }));

  return (
    <SiswaLayout
      header={`Jadwal Pelajaran`}
    >
      <Head title="Jadwal Pelajaran" />

      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 shadow-xl text-white">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 translate-y-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sky-400 shadow-inner">
                <CalendarDays className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Jadwal Pelajaran</h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1">
                  Mata pelajaran aktif kelas <span className="font-bold text-sky-400">{siswa?.id_kelas || '—'}</span> untuk Tahun Ajaran <span className="font-bold text-indigo-300">{tahunAjaranAktif?.tahun_ajaran || '—'}</span> ({tahunAjaranAktif?.semester || '—'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 self-start md:self-auto">
              <span className="text-xs text-slate-400 font-medium">Hari Ini:</span>
              <span className="px-3 py-1 text-xs font-bold rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/20">{todayName}</span>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {jadwalTersusun.map(({ hari, pelajaran }) => {
            const isToday = hari === todayName;
            return (
              <section 
                key={hari} 
                className={cn(
                  'rounded-2xl border p-5 shadow-sm transition-all duration-300',
                  isToday 
                    ? 'bg-gradient-to-b from-sky-50/40 to-indigo-50/10 border-sky-200 ring-1 ring-sky-200/50 shadow-sky-100/50' 
                    : 'bg-white border-slate-100'
                )}
              >
                <header className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <h3 className={cn('text-base font-bold tracking-tight', isToday ? 'text-sky-700' : 'text-slate-800')}>
                      {hari}
                    </h3>
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', isToday ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-500')}>
                      {pelajaran.length} Mapel
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(hari)}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 border',
                      collapsed[hari]
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60'
                        : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200/60'
                    )}
                    title={collapsed[hari] ? 'Tampilkan Jadwal' : 'Sembunyikan Jadwal'}
                  >
                    <span>{collapsed[hari] ? 'Tampilkan' : 'Tutup'}</span>
                    {collapsed[hari] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </header>

                <div className="mt-4">
                  {pelajaran.length > 0 ? (
                    <div className="space-y-4">
                      {!collapsed[hari] && pelajaran.map(p => <JadwalCard key={p.id_jadwal} pelajaran={p} />)}
                      {collapsed[hari] && (
                        <div className="text-center py-6 px-4 bg-slate-50/50 rounded-xl border border-slate-100">
                          <p className="text-xs font-semibold text-slate-400">Jadwal disembunyikan</p>
                          <button
                            onClick={() => toggle(hari)}
                            className="mt-2 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                          >
                            Klik untuk membuka jadwal
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">Tidak ada jadwal</p>
                      <p className="text-[10px] text-slate-400/80 mt-0.5">Hari ini bebas dari kegiatan belajar</p>
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
