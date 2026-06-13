import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import toast from 'react-hot-toast';
import {
  Users,
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send
} from 'lucide-react';

export default function Ajukan({ auth, jadwal, tanggal, guruList }) {
  const { data, setData, post, processing } = useForm({
    id_jadwal: jadwal.id_jadwal,
    tanggal: tanggal,
    target_gurus: [],
    keterangan: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.target_gurus.length === 0) {
      toast.error('Pilih minimal satu guru untuk diajukan.');
      return;
    }
    
    post(route('guru.pengganti.store'), {
      onSuccess: () => {
        // success handled by redirect with flash message
      },
      onError: (err) => {
        toast.error('Gagal mengajukan pengganti.');
      }
    });
  };

  const toggleGuru = (id) => {
    if (data.target_gurus.includes(id)) {
      setData('target_gurus', data.target_gurus.filter(g => g !== id));
    } else {
      setData('target_gurus', [...data.target_gurus, id]);
    }
  };

  const recommendedGuru = guruList.filter(g => g.is_recommended);
  const otherGuru = guruList.filter(g => !g.is_recommended);

  return (
    <GuruLayout user={auth?.user} header="Ajukan Guru Pengganti">
      <Head title="Ajukan Guru Pengganti" />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href={route('guru.absensi-harian.index')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Absensi Harian
        </Link>

        {/* Info Jadwal */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {jadwal?.kelas?.nama_kelas} - {jadwal?.mata_pelajaran?.nama_mapel || jadwal?.mapel?.nama_mapel}
              </h2>
              <div className="mt-2 flex flex-wrap gap-3 text-sm font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {tanggal}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {jadwal.jam_mulai.substring(0, 5)} - {jadwal.jam_selesai.substring(0, 5)}
                </span>
                {jadwal.ruang && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {jadwal.ruang}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-black text-slate-900">Pilih Guru Target</h3>
            
            <p className="mb-4 text-sm text-slate-500">
              Sistem merekomendasikan guru yang tidak memiliki jadwal mengajar pada jam yang sama. Anda dapat memilih lebih dari satu target.
            </p>

            <div className="space-y-4">
              {/* Rekomendasi */}
              {recommendedGuru.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-bold text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Rekomendasi (Kosong)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendedGuru.map(g => (
                      <label 
                        key={g.id_guru}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                          data.target_gurus.includes(g.id_guru) 
                            ? 'border-indigo-500 bg-indigo-50/50' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={data.target_gurus.includes(g.id_guru)}
                            onChange={() => toggleGuru(g.id_guru)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{g.nama_lengkap}</p>
                            <p className="text-xs font-medium text-slate-500">{g.nip || 'NIP -'}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Lainnya */}
              {otherGuru.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-bold text-amber-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Ada Jadwal Mengajar Lain
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherGuru.map(g => (
                      <label 
                        key={g.id_guru}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                          data.target_gurus.includes(g.id_guru) 
                            ? 'border-indigo-500 bg-indigo-50/50' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={data.target_gurus.includes(g.id_guru)}
                            onChange={() => toggleGuru(g.id_guru)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{g.nama_lengkap}</p>
                            <p className="text-xs font-medium text-slate-500">{g.nip || 'NIP -'}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-black text-slate-900">
                Keterangan / Pesan
              </label>
              <textarea
                value={data.keterangan}
                onChange={e => setData('keterangan', e.target.value)}
                rows={3}
                placeholder="Contoh: Tolong gantikan saya karena saya ada dinas luar. Materi sudah di meja."
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={route('guru.absensi-harian.index')}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing || data.target_gurus.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-black text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Kirim Pengajuan
            </button>
          </div>
        </form>

      </div>
    </GuruLayout>
  );
}
