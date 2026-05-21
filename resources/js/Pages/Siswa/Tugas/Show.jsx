import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { 
    ClipboardDocumentListIcon, 
    CalendarIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

export default function Show({ auth, tugas, pengumpulan }) {
    const isPastDue = new Date(tugas.tenggat_waktu) < new Date();
    const canSubmit = !isPastDue && (!pengumpulan || pengumpulan.status_pengumpulan !== 'Dinilai');

    const { data, setData, post, processing, errors } = useForm({
        teks_jawaban: pengumpulan ? (pengumpulan.teks_jawaban || '') : '',
        file_jawaban: null
    });

    const submit = (e) => {
        e.preventDefault();
        // Since we are uploading file, use POST
        post(route('siswa.tugas.kumpulkan', tugas.id_tugas));
    };

    return (
        <SiswaLayout user={auth.user} header="Detail Tugas">
            <Head title="Detail Tugas" />

            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                
                {/* Informasi Tugas */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div>
                            <div className="text-sm font-semibold text-indigo-600 mb-1">
                                {tugas.jadwal_mengajar?.mata_pelajaran?.nama_mapel || 'Mata Pelajaran Tidak Diketahui'}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <h2 className="text-2xl font-bold text-slate-800">{tugas.judul_tugas}</h2>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit border
                                    ${tugas.tipe_tugas === 'Pemberitahuan' 
                                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                                    {tugas.tipe_tugas === 'Pemberitahuan' ? '🔔 Pemberitahuan' : '📤 Upload Tugas'}
                                </span>
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                                Guru: {tugas.jadwal_mengajar?.guru?.nama_lengkap || 'Guru Tidak Diketahui'}
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none text-sm">
                            <h4 className="text-sm font-bold text-slate-700">Instruksi / Deskripsi:</h4>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 whitespace-pre-wrap text-slate-700 mt-2">
                                {tugas.deskripsi || <span className="italic text-slate-400">Tidak ada instruksi tambahan.</span>}
                            </div>
                        </div>

                        {tugas.file_tugas && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-2">Lampiran File dari Guru:</h4>
                                <a 
                                    href={`/storage-public/${tugas.file_tugas}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-100"
                                >
                                    <DocumentTextIcon className="w-5 h-5" />
                                    Download Materi / Soal
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-72 flex flex-col gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tenggat Waktu</div>
                            <div className={`flex items-center gap-2 font-medium ${isPastDue ? 'text-red-600' : 'text-slate-800'}`}>
                                <CalendarIcon className={`w-5 h-5 ${isPastDue ? 'text-red-500' : 'text-indigo-500'}`} />
                                {new Date(tugas.tenggat_waktu).toLocaleString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status Anda</div>
                            {pengumpulan ? (
                                <div className="space-y-2">
                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                        ${(pengumpulan.status_pengumpulan === 'Dinilai' || pengumpulan.status_pengumpulan === 'Selesai') 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                            : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                        {pengumpulan.status_pengumpulan}
                                    </div>
                                    {pengumpulan.status_pengumpulan === 'Dinilai' && (
                                        <div className="pt-2 border-t border-slate-200 mt-2">
                                            <div className="text-xs text-slate-500 mb-1">Nilai:</div>
                                            <div className="text-2xl font-black text-emerald-600">{pengumpulan.nilai}</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                    ${isPastDue ? 'bg-red-50 text-red-700 border-red-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                    {isPastDue ? 'Ditutup (Terlambat)' : 'Belum Mengumpulkan'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Pengumpulan */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <ArrowUpTrayIcon className="w-5 h-5 text-indigo-600" />
                        {tugas.tipe_tugas === 'Pemberitahuan' ? 'Konfirmasi Pembacaan & Penyelesaian' : 'Pengumpulan Jawaban'}
                    </h3>

                    {pengumpulan && pengumpulan.status_pengumpulan === 'Dinilai' ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 flex items-start gap-3">
                                <CheckCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Tugas ini sudah dinilai oleh guru.</p>
                                    <p className="text-sm mt-1">Anda tidak dapat lagi mengubah jawaban yang telah dikumpulkan.</p>
                                </div>
                            </div>

                            {pengumpulan.catatan_guru && (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <h4 className="text-sm font-bold text-slate-700 mb-1">Catatan dari Guru:</h4>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{pengumpulan.catatan_guru}</p>
                                </div>
                            )}

                            {tugas.tipe_tugas === 'Pemberitahuan' ? (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 flex items-start gap-3">
                                    <CheckCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-900">Tugas Telah Dikonfirmasi Selesai</p>
                                        {pengumpulan.waktu_pengumpulan && (
                                            <p className="text-xs text-emerald-600 mt-1">
                                                Dikonfirmasi pada: {new Date(pengumpulan.waktu_pengumpulan).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pengumpulan.teks_jawaban && (
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 mb-2">Teks Jawaban Anda:</h4>
                                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                                {pengumpulan.teks_jawaban}
                                            </div>
                                        </div>
                                    )}
                                    {pengumpulan.file_jawaban && (
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 mb-2">File Jawaban Anda:</h4>
                                            <a 
                                                href={`/storage-public/${pengumpulan.file_jawaban}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium border border-slate-200"
                                            >
                                                <DocumentTextIcon className="w-5 h-5" />
                                                Lihat File yang Dikumpulkan
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : isPastDue && !pengumpulan ? (
                        <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                            <p className="font-semibold text-red-800">Waktu pengumpulan tugas telah ditutup.</p>
                        </div>
                    ) : tugas.tipe_tugas === 'Pemberitahuan' ? (
                        /* TAMPILAN TUGAS TIPE PEMBERITAHUAN */
                        pengumpulan && (pengumpulan.status_pengumpulan === 'Selesai' || pengumpulan.status_pengumpulan === 'Menunggu Penilaian') ? (
                            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 flex items-start gap-4">
                                <CheckCircleIcon className="w-8 h-8 text-emerald-600 flex-shrink-0 animate-bounce" />
                                <div>
                                    <h4 className="font-bold text-lg text-emerald-900">Tugas Telah Dikonfirmasi Selesai!</h4>
                                    <p className="text-sm mt-1 text-emerald-700">Anda telah membaca dan menandai tugas pemberitahuan ini sebagai selesai.</p>
                                    {pengumpulan.waktu_pengumpulan && (
                                        <p className="text-xs mt-2 text-emerald-600 font-semibold">
                                            Dikonfirmasi pada: {new Date(pengumpulan.waktu_pengumpulan).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm flex items-start gap-3">
                                    <span className="text-lg">🔔</span>
                                    <div>
                                        <p className="font-semibold text-amber-900 text-base">Tugas Tipe Pemberitahuan / Informasi</p>
                                        <p className="mt-1 text-amber-700 leading-relaxed">Tugas ini tidak memerlukan pengunggahan berkas atau teks jawaban. Silakan pelajari deskripsi instruksi di atas, kemudian klik tombol di bawah untuk mengonfirmasi bahwa Anda telah menyelesaikannya.</p>
                                    </div>
                                </div>
                                
                                <form onSubmit={submit} className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                                    <Link href={route('siswa.tugas.index')}>
                                        <SecondaryButton>Kembali</SecondaryButton>
                                    </Link>
                                    <PrimaryButton 
                                        className="bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500 border-none text-white transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg" 
                                        disabled={processing || !canSubmit}
                                    >
                                        {processing ? 'Memproses...' : 'Tandai Tugas Ini Sebagai Selesai'}
                                    </PrimaryButton>
                                </form>
                            </div>
                        )
                    ) : (
                        /* TAMPILAN TUGAS TIPE UPLOAD (STANDARD) */
                        <form onSubmit={submit} className="space-y-6">
                            
                            {pengumpulan && pengumpulan.status_pengumpulan === 'Menunggu Penilaian' && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 mb-6 text-sm">
                                    Anda sudah mengumpulkan tugas ini, namun masih dapat memperbarui jawaban sebelum dinilai atau batas waktu berakhir.
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teks Jawaban</label>
                                <textarea
                                    value={data.teks_jawaban}
                                    onChange={e => setData('teks_jawaban', e.target.value)}
                                    className="w-full border-slate-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    rows="6"
                                    placeholder="Ketik jawaban Anda di sini (jika diminta menjawab dengan teks)..."
                                ></textarea>
                                <InputError message={errors.teks_jawaban} className="mt-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Upload File Jawaban (PDF/Word/JPG/ZIP, max 10MB)</label>
                                
                                {pengumpulan && pengumpulan.file_jawaban && (
                                    <div className="mb-3">
                                        <a href={`/storage-public/${pengumpulan.file_jawaban}`} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline inline-flex items-center gap-1">
                                            <DocumentTextIcon className="w-4 h-4" /> File Saat Ini (Klik untuk lihat)
                                        </a>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    onChange={e => setData('file_jawaban', e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-slate-500
                                    file:mr-4 file:py-2.5 file:px-4
                                    file:rounded-xl file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100"
                                />
                                <p className="mt-2 text-xs text-slate-500">* Jika Anda mengupload file baru, file yang lama akan tergantikan.</p>
                                <InputError message={errors.file_jawaban} className="mt-2" />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                                <Link href={route('siswa.tugas.index')}>
                                    <SecondaryButton>Kembali</SecondaryButton>
                                </Link>
                                <PrimaryButton disabled={processing || !canSubmit}>
                                    {processing ? 'Mengirim...' : 'Kumpulkan Jawaban'}
                                </PrimaryButton>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </SiswaLayout>
    );
}
