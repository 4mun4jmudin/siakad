import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { PlusIcon, TrashIcon, BookOpenIcon, ClockIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function Edit({ auth, mataPelajaran, gurus, kelasList }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_mapel: mataPelajaran.nama_mapel || '',
        kategori: mataPelajaran.kategori || 'Wajib',
        kkm: mataPelajaran.kkm || '0',
        status: mataPelajaran.status || 'Aktif',
        id_guru_default: mataPelajaran.id_guru_default || '', // <-- Field baru
        jumlah_jp: mataPelajaran.jumlah_jp || '',
        jadwal: mataPelajaran.jadwal_mengajar || [],
    });

    const addJadwalRow = () => {
        setData('jadwal', [...data.jadwal, {
            id_guru: data.id_guru_default || '',
            id_kelas: '',
            hari: 'Senin',
            jam_mulai: '',
            jam_selesai: ''
        }]);
    };

    const removeJadwalRow = (index) => {
        const newJadwal = [...data.jadwal];
        newJadwal.splice(index, 1);
        setData('jadwal', newJadwal);
    };

    const handleJadwalChange = (index, field, value) => {
        const newJadwal = [...data.jadwal];
        newJadwal[index][field] = value;
        setData('jadwal', newJadwal);
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.mata-pelajaran.update', mataPelajaran.id_mapel));
    };

    return (
        <AdminLayout user={auth.user} header="Edit Mata Pelajaran">
            <Head title={`Edit ${mataPelajaran.nama_mapel}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6 lg:p-8 pb-16">
                <div className="max-w-[1440px] mx-auto animate-fadeInUp">
                    
                    {/* Header Top */}
                    <div className="mb-8">
                        <Link href={route('admin.mata-pelajaran.index')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center mb-3 transition-colors bg-white/60 w-fit px-4 py-2 rounded-xl backdrop-blur-sm border border-white shadow-sm">
                            <ChevronLeftIcon className="w-4 h-4 mr-1.5 stroke-2" />
                            Kembali ke Daftar
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Edit Mata Pelajaran
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">
                            Perbarui detail kurikulum mata pelajaran dan atur jadwal mengajar.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        
                        {/* Section 1: Detail Mata Pelajaran */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 p-6 md:p-8">
                            <div className="flex items-center mb-8 border-b border-slate-100/50 pb-4">
                                <div className="bg-indigo-100/80 p-3 rounded-2xl mr-4 text-indigo-600 shadow-inner">
                                    <BookOpenIcon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Detail Utama</h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Informasi dasar mata pelajaran</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <InputLabel htmlFor="nama_mapel" value="Nama Mata Pelajaran" className="font-semibold text-slate-700" />
                                    <TextInput 
                                        id="nama_mapel" 
                                        value={data.nama_mapel} 
                                        onChange={(e) => setData('nama_mapel', e.target.value)} 
                                        className="mt-2 block w-full bg-white/80 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm py-2.5 font-medium" 
                                        isFocused={true} 
                                    />
                                    <InputError message={errors.nama_mapel} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="kategori" value="Kategori" className="font-semibold text-slate-700" />
                                    <select 
                                        id="kategori" 
                                        value={data.kategori} 
                                        onChange={(e) => setData('kategori', e.target.value)} 
                                        className="mt-2 block w-full bg-white/80 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm py-2.5 font-bold text-slate-700"
                                    >
                                        <option value="Wajib">Wajib (Semua Jurusan)</option>
                                        <option value="Peminatan">Peminatan (Khusus Jurusan)</option>
                                        <option value="Muatan Lokal">Muatan Lokal</option>
                                        <option value="Produktif DPIB">Produktif DPIB</option>
                                        <option value="Produktif DKV">Produktif DKV</option>
                                        <option value="Produktif ATPH">Produktif ATPH</option>
                                    </select>
                                    <InputError message={errors.kategori} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="status" value="Status" className="font-semibold text-slate-700" />
                                    <select 
                                        id="status" 
                                        value={data.status} 
                                        onChange={(e) => setData('status', e.target.value)} 
                                        className="mt-2 block w-full bg-white/80 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm py-2.5 font-bold text-slate-700"
                                    >
                                        <option value="Aktif">Aktif Diajarkan</option>
                                        <option value="Tidak Aktif">Tidak Aktif</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
                                
                                <div className="md:col-span-1">
                                    <InputLabel htmlFor="id_guru_default" value="Guru Pengampu Utama (Opsional)" className="font-semibold text-slate-700" />
                                    <select
                                        id="id_guru_default"
                                        value={data.id_guru_default}
                                        onChange={(e) => {
                                            const newGuruId = e.target.value;
                                            // Set id_guru_default
                                            setData((prevData) => {
                                                // Update jadwal: Jika ada row yang id_guru nya kosong, isi dengan guru default yang baru
                                                const newJadwal = prevData.jadwal.map(j => {
                                                    if (!j.id_guru) {
                                                        return { ...j, id_guru: newGuruId };
                                                    }
                                                    return j;
                                                });
                                                
                                                return {
                                                    ...prevData,
                                                    id_guru_default: newGuruId,
                                                    jadwal: newJadwal
                                                };
                                            });
                                        }}
                                        className="mt-2 block w-full bg-white/80 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm py-2.5"
                                    >
                                        <option value="">-- Pilih Guru Utama (Bisa dikosongkan) --</option>
                                        {gurus.map((g) => (
                                            <option key={g.id_guru} value={g.id_guru}>{g.nama_lengkap}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.id_guru_default} className="mt-2" />
                                </div>

                                <div className="md:col-span-1">
                                    <InputLabel htmlFor="jumlah_jp" value="Jumlah Jam Pelajaran (JP) per Minggu" className="font-semibold text-slate-700" />
                                    <TextInput 
                                        id="jumlah_jp" 
                                        type="number" 
                                        value={data.jumlah_jp} 
                                        onChange={(e) => setData('jumlah_jp', e.target.value)} 
                                        className="mt-2 block w-full bg-white/80 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm py-2.5 font-medium" 
                                    />
                                    <InputError message={errors.jumlah_jp} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Jadwal Mengajar */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-100/50 pb-4">
                                <div className="flex items-center">
                                    <div className="bg-blue-100/80 p-3 rounded-2xl mr-4 text-blue-600 shadow-inner">
                                        <ClockIcon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Jadwal Mengajar</h2>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Plotting guru dan jam kelas</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={addJadwalRow} 
                                    className="flex items-center justify-center text-sm font-bold bg-white text-indigo-700 px-5 py-2.5 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 border border-slate-200 w-full sm:w-auto shadow-sm"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2 stroke-2"/> Tambah Baris Jadwal
                                </button>
                            </div>
                            
                            <InputError message={errors.jadwal} className="mb-4" />
                            
                            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/40 shadow-sm">
                                {data.jadwal.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-[11px] text-slate-500 uppercase tracking-[0.1em] font-bold bg-slate-100/50 border-b border-slate-200/60">
                                                <tr>
                                                    <th className="px-5 py-4">Guru Pengampu</th>
                                                    <th className="px-5 py-4">Kelas</th>
                                                    <th className="px-5 py-4">Hari</th>
                                                    <th className="px-5 py-4">Mulai</th>
                                                    <th className="px-5 py-4">Selesai</th>
                                                    <th className="px-5 py-4 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100/50">
                                                {data.jadwal.map((jadwal, index) => (
                                                    <tr key={index} className="hover:bg-white/80 transition-colors duration-150">
                                                        <td className="px-4 py-3 min-w-[200px]">
                                                            <select 
                                                                value={jadwal.id_guru} 
                                                                onChange={e => handleJadwalChange(index, 'id_guru', e.target.value)} 
                                                                className="w-full border-slate-200 bg-white/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm h-11 font-medium text-slate-700"
                                                            >
                                                                <option value="">-- Pilih Guru --</option>
                                                                {gurus.map(guru => <option key={guru.id_guru} value={guru.id_guru}>{guru.nama_lengkap}</option>)}
                                                            </select>
                                                            <InputError message={errors[`jadwal.${index}.id_guru`]} className="mt-1.5 text-xs" />
                                                        </td>
                                                        <td className="px-4 py-3 min-w-[150px]">
                                                            <select 
                                                                value={jadwal.id_kelas} 
                                                                onChange={e => handleJadwalChange(index, 'id_kelas', e.target.value)} 
                                                                className="w-full border-slate-200 bg-white/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm h-11 font-medium text-slate-700"
                                                            >
                                                                <option value="">-- Pilih Kelas --</option>
                                                                {kelasList.map(k => <option key={k.id_kelas} value={k.id_kelas}>{k.tingkat}-{k.jurusan}</option>)}
                                                            </select>
                                                            <InputError message={errors[`jadwal.${index}.id_kelas`]} className="mt-1.5 text-xs" />
                                                        </td>
                                                        <td className="px-4 py-3 min-w-[130px]">
                                                            <select 
                                                                value={jadwal.hari} 
                                                                onChange={e => handleJadwalChange(index, 'hari', e.target.value)} 
                                                                className="w-full border-slate-200 bg-white/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm h-11 font-bold text-slate-700"
                                                            >
                                                                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => <option key={day}>{day}</option>)}
                                                            </select>
                                                            <InputError message={errors[`jadwal.${index}.hari`]} className="mt-1.5 text-xs" />
                                                        </td>
                                                        <td className="px-4 py-3 min-w-[120px]">
                                                            <TextInput 
                                                                type="time" 
                                                                value={jadwal.jam_mulai} 
                                                                onChange={e => handleJadwalChange(index, 'jam_mulai', e.target.value)} 
                                                                className="w-full border-slate-200 bg-white/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm h-11 font-mono font-bold text-slate-700"
                                                            />
                                                            <InputError message={errors[`jadwal.${index}.jam_mulai`]} className="mt-1.5 text-xs" />
                                                        </td>
                                                        <td className="px-4 py-3 min-w-[120px]">
                                                            <TextInput 
                                                                type="time" 
                                                                value={jadwal.jam_selesai} 
                                                                onChange={e => handleJadwalChange(index, 'jam_selesai', e.target.value)} 
                                                                className="w-full border-slate-200 bg-white/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl shadow-sm transition-all text-sm h-11 font-mono font-bold text-slate-700"
                                                            />
                                                            <InputError message={errors[`jadwal.${index}.jam_selesai`]} className="mt-1.5 text-xs" />
                                                        </td>
                                                        <td className="px-4 py-3 text-center align-middle">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeJadwalRow(index)} 
                                                                className="inline-flex items-center justify-center p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors duration-200"
                                                                title="Hapus Jadwal"
                                                            >
                                                                <TrashIcon className="h-5 w-5 stroke-2"/>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/40">
                                        <div className="bg-white p-5 rounded-full mb-4 shadow-sm border border-slate-100">
                                            <ClockIcon className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">Daftar Jadwal Kosong</h3>
                                        <p className="text-slate-500 text-sm font-medium max-w-sm">Klik tombol "Tambah Baris Jadwal" di atas jika Anda ingin mengatur plotting jadwal.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 flex justify-end items-center gap-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg p-6">
                            <Link 
                                href={route('admin.mata-pelajaran.index')} 
                                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                            >
                                Batal
                            </Link>
                            <button 
                                type="submit"
                                disabled={processing}
                                className={`px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:ring-4 focus:ring-indigo-500/30 transition-all duration-200 flex items-center ${processing ? 'opacity-75 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'}`}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan Update...
                                    </>
                                ) : 'Update Mata Pelajaran'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.4s ease-out both; }
            `}</style>
        </AdminLayout>
    );
}
