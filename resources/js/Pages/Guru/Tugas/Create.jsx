import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function Create({ auth, jadwalOptions }) {
    const { data, setData, post, processing, errors } = useForm({
        id_jadwal: '',
        judul_tugas: '',
        deskripsi: '',
        tenggat_waktu: '',
        status: 'Diterbitkan',
        file_tugas: null,
        tipe_tugas: 'Upload',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('guru.tugas.store'));
    };

    return (
        <GuruLayout user={auth.user} header="Buat Tugas Baru">
            <Head title="Buat Tugas Baru" />

            <div className="max-w-4xl mx-auto pb-12 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600" />
                        Formulir Tugas
                    </h2>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="id_jadwal" value="Pilih Kelas & Mata Pelajaran" />
                            <select
                                id="id_jadwal"
                                value={data.id_jadwal}
                                onChange={e => setData('id_jadwal', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">--- Pilih Kelas ---</option>
                                {jadwalOptions.map(jadwal => (
                                    <option key={jadwal.id_jadwal} value={jadwal.id_jadwal}>
                                        {jadwal.kelas?.tingkat || ''} {jadwal.kelas?.jurusan || ''} - {jadwal.mata_pelajaran?.nama_mapel || ''} ({jadwal.hari}, {jadwal.jam_mulai ? jadwal.jam_mulai.substring(0,5) : ''})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.id_jadwal} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="judul_tugas" value="Judul Tugas" />
                            <TextInput
                                id="judul_tugas"
                                type="text"
                                value={data.judul_tugas}
                                onChange={e => setData('judul_tugas', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Contoh: Makalah Sejarah Kemerdekaan"
                            />
                            <InputError message={errors.judul_tugas} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="deskripsi" value="Deskripsi / Instruksi" />
                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={e => setData('deskripsi', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows="5"
                                placeholder="Tuliskan instruksi lengkap pengerjaan tugas di sini..."
                            ></textarea>
                            <InputError message={errors.deskripsi} className="mt-2" />
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <InputLabel value="Tipe Tugas" className="font-bold text-slate-700" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                    data.tipe_tugas === 'Upload' 
                                        ? 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500/10' 
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="tipe_tugas" 
                                        value="Upload" 
                                        checked={data.tipe_tugas === 'Upload'}
                                        onChange={e => setData('tipe_tugas', e.target.value)}
                                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="block font-semibold text-slate-800 text-sm">Upload Jawaban</span>
                                        <span className="block text-xs text-slate-500 mt-0.5">Siswa wajib mengirimkan teks atau mengunggah berkas pengerjaan (Gambar, PDF, dll).</span>
                                    </div>
                                </label>
                                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                    data.tipe_tugas === 'Pemberitahuan' 
                                        ? 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500/10' 
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="tipe_tugas" 
                                        value="Pemberitahuan" 
                                        checked={data.tipe_tugas === 'Pemberitahuan'}
                                        onChange={e => setData('tipe_tugas', e.target.value)}
                                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="block font-semibold text-slate-800 text-sm">Hanya Pemberitahuan</span>
                                        <span className="block text-xs text-slate-500 mt-0.5">Siswa hanya perlu membaca instruksi dan menandai tugas selesai tanpa unggah berkas.</span>
                                    </div>
                                </label>
                            </div>
                            <InputError message={errors.tipe_tugas} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="tenggat_waktu" value="Tenggat Waktu (Deadline)" />
                                <TextInput
                                    id="tenggat_waktu"
                                    type="datetime-local"
                                    value={data.tenggat_waktu}
                                    onChange={e => setData('tenggat_waktu', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.tenggat_waktu} className="mt-2" />
                            </div>
                            
                            <div>
                                <InputLabel htmlFor="status" value="Status Tugas" />
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="Diterbitkan">Terbitkan (Siswa dapat melihat)</option>
                                    <option value="Draft">Draft (Disembunyikan dari siswa)</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="file_tugas" value="Upload File Lampiran (Opsional, PDF/Word/JPG, max 5MB)" />
                            <input
                                type="file"
                                id="file_tugas"
                                onChange={e => setData('file_tugas', e.target.files[0])}
                                className="mt-1 block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-xl file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                            />
                            <InputError message={errors.file_tugas} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                            <Link href={route('guru.tugas.index')}>
                                <SecondaryButton>Batal</SecondaryButton>
                            </Link>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Tugas'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuruLayout>
    );
}
