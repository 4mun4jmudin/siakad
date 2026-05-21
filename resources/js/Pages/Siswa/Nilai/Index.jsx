import React, { useState } from 'react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Head, router } from '@inertiajs/react';
import { Award, BookOpen, CheckCircle2, XCircle, ChevronDown, ChevronUp, FileSpreadsheet, Calendar, BookOpenCheck, Bookmark } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const StatCard = ({ title, value, subtitle, icon: Icon, gradient }) => {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl p-6 shadow-sm border border-slate-100 bg-white transition-all duration-300 hover:shadow-md")}>
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 h-24 w-24 rounded-full bg-slate-50 opacity-40 blur-lg pointer-events-none" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
          <p className="text-[11px] font-semibold text-slate-500">{subtitle}</p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md shadow-indigo-100", gradient)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const GradeComponentBadge = ({ type }) => {
  const componentMap = {
    Tugas: 'bg-blue-50 text-blue-700 border-blue-100',
    UH: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    PTS: 'bg-purple-50 text-purple-700 border-purple-100',
    PAS: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    Praktik: 'bg-amber-50 text-amber-700 border-amber-100',
    Proyek: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-lg text-[10px] font-bold border', componentMap[type] || 'bg-slate-50 text-slate-700 border-slate-100')}>
      {type}
    </span>
  );
};

export default function NilaiIndex({ auth, siswa, penilaian = [], tahunAjarans = [], selectedTahunAjaranId, selectedSemester, stats }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleYearChange = (tahunId) => {
    router.get(route('siswa.nilai.index'), {
      id_tahun_ajaran: tahunId,
      semester: selectedSemester
    }, { preserveState: true });
  };

  const handleSemesterChange = (sem) => {
    router.get(route('siswa.nilai.index'), {
      id_tahun_ajaran: selectedTahunAjaranId,
      semester: sem
    }, { preserveState: true });
  };

  return (
    <SiswaLayout header="Daftar Nilai Akademik">
      <Head title="Lihat Nilai" />

      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 shadow-xl text-white">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sky-400 shadow-inner">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Portal Nilai Akademik</h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1">
                  Evaluasi pencapaian hasil belajar Anda pada setiap mata pelajaran per semester secara terperinci.
                </p>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
                <button 
                  onClick={() => handleSemesterChange('Ganjil')} 
                  className={cn(
                    'px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200', 
                    selectedSemester === 'Ganjil' 
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  Semester Ganjil
                </button>
                <button 
                  onClick={() => handleSemesterChange('Genap')} 
                  className={cn(
                    'px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200', 
                    selectedSemester === 'Genap' 
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  Semester Genap
                </button>
              </div>

              <select 
                value={selectedTahunAjaranId} 
                onChange={e => handleYearChange(e.target.value)} 
                className="bg-slate-900 border-white/10 text-xs font-bold rounded-2xl py-2 pl-4 pr-10 focus:ring-sky-500/20 focus:border-sky-500/70 text-slate-200"
              >
                {tahunAjarans.map(ta => (
                  <option key={ta.id_tahun_ajaran} value={ta.id_tahun_ajaran} className="text-slate-800 font-bold bg-white">
                    Tahun Ajaran {ta.tahun_ajaran}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Rata-Rata Nilai Akhir" 
            value={stats.rata_rata} 
            subtitle="Akumulasi seluruh pelajaran" 
            icon={FileSpreadsheet} 
            gradient="bg-gradient-to-tr from-sky-500 to-sky-600 shadow-sky-200" 
          />
          <StatCard 
            title="Total Mata Pelajaran" 
            value={stats.total_mapel} 
            subtitle="Yang terdaftar di kelas Anda" 
            icon={BookOpen} 
            gradient="bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-indigo-200" 
          />
          <StatCard 
            title="Mata Pelajaran Tuntas" 
            value={stats.mapel_tuntas} 
            subtitle="Memenuhi KKM kelulusan" 
            icon={CheckCircle2} 
            gradient="bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-emerald-200" 
          />
          <StatCard 
            title="Mata Pelajaran Tidak Tuntas" 
            value={stats.mapel_tidak_tuntas} 
            subtitle="Di bawah batas KKM kelulusan" 
            icon={XCircle} 
            gradient="bg-gradient-to-tr from-rose-500 to-rose-600 shadow-rose-200" 
          />
        </div>

        {/* Grades List Section */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <BookOpenCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-800">Daftar Hasil Pembelajaran</h3>
          </div>

          <div className="space-y-4">
            {penilaian.map((row) => {
              const isExpanded = expandedId === row.id_penilaian;
              const hasPassed = row.tuntas;
              const mapelName = row.mapel?.nama_mapel || 'Mata Pelajaran';
              const mapelKategori = row.mapel?.kategori || 'Umum';
              const kkmVal = Number(row.mapel?.kkm) || 75;

              return (
                <div 
                  key={row.id_penilaian} 
                  className={cn(
                    "rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm",
                    isExpanded 
                      ? 'border-sky-200 bg-slate-50/20 shadow-md shadow-sky-100/30' 
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                  )}
                >
                  {/* Card Header Panel */}
                  <div 
                    onClick={() => toggleExpand(row.id_penilaian)}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl font-extrabold text-sm shadow-sm flex-shrink-0",
                        hasPassed 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100/50'
                      )}>
                        {row.nilai_akhir ? Math.round(row.nilai_akhir) : '—'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-800 truncate">{mapelName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/40">
                            {mapelKategori}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">KKM: {kkmVal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto gap-6 self-stretch md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-50">
                      <div className="flex items-center gap-6">
                        {/* Predikat */}
                        <div className="text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Predikat</span>
                          <p className="text-sm font-extrabold text-slate-800 mt-0.5">{row.predikat || '—'}</p>
                        </div>
                        
                        {/* Nilai Akhir */}
                        <div className="text-center">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Nilai Akhir</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">{row.nilai_akhir || '—'}</p>
                        </div>

                        {/* Status Tuntas */}
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Kelulusan</span>
                          {hasPassed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200/50">
                              Tuntas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100/90 text-rose-800 border border-rose-200/50">
                              Tidak Tuntas
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 border",
                          isExpanded 
                            ? 'bg-sky-50 border-sky-200 text-sky-700' 
                            : 'bg-slate-50 border-slate-200/60 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        )}
                        aria-label="Expand details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details Panel */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/30 p-5 space-y-5 animate-fade-in">
                      
                      {/* Teacher Notes */}
                      {row.catatan && (
                        <div className="p-4 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex gap-3">
                          <Bookmark className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-indigo-600">Catatan/Rekomendasi Guru Pengampu:</p>
                            <p className="text-xs text-slate-600 font-medium italic">"{row.catatan}"</p>
                          </div>
                        </div>
                      )}

                      {/* Components Evaluation Table */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rincian Komponen Penilaian</p>
                        <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-inner bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-slate-600">
                              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 font-bold border-b border-slate-100 tracking-wider">
                                <tr>
                                  <th className="px-5 py-3">Komponen</th>
                                  <th className="px-5 py-3">Tanggal Penilaian</th>
                                  <th className="px-5 py-3">Deskripsi Kegiatan</th>
                                  <th className="px-5 py-3 text-right">Bobot (%)</th>
                                  <th className="px-5 py-3 text-right">Nilai Angka</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 font-medium">
                                {row.details && row.details.length > 0 ? (
                                  row.details.map((detail) => (
                                    <tr key={detail.id_detail} className="hover:bg-slate-50/40">
                                      <td className="px-5 py-3"><GradeComponentBadge type={detail.komponen} /></td>
                                      <td className="px-5 py-3 font-semibold text-slate-500">
                                        {detail.tanggal 
                                          ? new Date(detail.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                                          : '—'}
                                      </td>
                                      <td className="px-5 py-3 text-slate-700 font-bold">{detail.deskripsi || '—'}</td>
                                      <td className="px-5 py-3 text-right text-slate-500 font-bold">{detail.bobot ? `${Math.round(detail.bobot)}%` : '—'}</td>
                                      <td className="px-5 py-3 text-right font-black text-slate-800">{detail.nilai}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="5" className="px-5 py-8 text-center text-slate-400 font-semibold">
                                      Belum ada komponen penilaian rincian yang dimasukkan oleh guru untuk mata pelajaran ini.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}

            {penilaian.length === 0 && (
              <div className="text-center py-20 px-4 border border-dashed border-slate-200 rounded-3xl">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">Hasil Pembelajaran Kosong</p>
                <p className="text-xs text-slate-400 mt-1">Belum ada data nilai akademik yang diterbitkan pada semester ini.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </SiswaLayout>
  );
}
