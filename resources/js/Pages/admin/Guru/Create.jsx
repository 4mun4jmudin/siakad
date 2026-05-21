import React, { useState, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    PhotoIcon,
    XMarkIcon,
    UserIcon,
    IdentificationIcon,
    BriefcaseIcon,
    QrCodeIcon,
    FingerPrintIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        id_guru: '',
        nama_lengkap: '',
        nip: '',
        jenis_kelamin: 'Laki-laki',
        status: 'Aktif',
        foto_profil: null,
        barcode_id: '',
        sidik_jari_template: '',
    });

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('foto_profil', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        setData('foto_profil', null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const generateBarcode = () => {
        const random = Math.floor(100000 + Math.random() * 900000);
        setData('barcode_id', `G${random}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.guru.store'));
    };

    return (
        <AdminLayout user={auth.user} header="Tambah Guru">
            <Head title="Tambah Guru" />

            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">
                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Tambah Guru Baru</h2>
                            <p className="mt-1 text-blue-100 text-sm max-w-xl">
                                Lengkapi biodata di bawah. Akun login akan dibuat otomatis oleh sistem.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={route('admin.guru.index')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 text-sm font-medium"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                Kembali
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-700 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-white/20 font-semibold text-sm"
                            >
                                {processing ? (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    'Simpan Data'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Kolom Kiri: Foto & Identitas Sistem */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Upload Foto */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md">
                            <label className="block text-sm font-semibold text-gray-700 mb-4">Foto Profil</label>

                            <div
                                className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-200 min-h-[240px] cursor-pointer ${preview
                                        ? 'border-blue-200 bg-blue-50/30'
                                        : 'border-gray-200 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/20'
                                    }`}
                                onClick={() => !preview && fileInputRef.current.click()}
                            >
                                {preview ? (
                                    <div className="relative w-full h-52 group">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-full object-contain rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg backdrop-blur-sm">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removePhoto();
                                                }}
                                                className="bg-white/90 text-red-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white transition shadow-lg"
                                            >
                                                Hapus Foto
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 ring-4 ring-blue-100">
                                            <PhotoIcon className="h-8 w-8 text-blue-500" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">Klik untuk unggah foto</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG (maks 2MB)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {errors.foto_profil && (
                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                    <XMarkIcon className="h-3 w-3" />
                                    {errors.foto_profil}
                                </p>
                            )}
                        </div>

                        {/* Identitas Sistem */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-pink-500 rounded-full" />
                                <h3 className="text-sm font-bold text-gray-800">Identitas Sistem</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Barcode */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Barcode ID</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <QrCodeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={data.barcode_id}
                                                onChange={(e) => setData('barcode_id', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all bg-gray-50/50 placeholder:text-gray-400"
                                                placeholder="Scan / Generate"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={generateBarcode}
                                            className="px-4 py-2.5 bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-semibold hover:from-orange-100 hover:to-pink-100 transition-all shadow-sm"
                                        >
                                            Auto
                                        </button>
                                    </div>
                                    {errors.barcode_id && (
                                        <p className="text-red-500 text-xs mt-1">{errors.barcode_id}</p>
                                    )}
                                </div>

                                {/* Template Sidik Jari */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Template Sidik Jari</label>
                                    <div className="relative">
                                        <FingerPrintIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <textarea
                                            rows={3}
                                            value={data.sidik_jari_template}
                                            onChange={(e) => setData('sidik_jari_template', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all bg-gray-50/50 placeholder:text-gray-400 resize-none"
                                            placeholder="Data template fingerprint (opsional)..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Biodata Lengkap */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-shadow hover:shadow-md">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                                <h3 className="text-lg font-bold text-gray-800">Biodata Lengkap</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* ID Guru */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        ID Guru <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.id_guru}
                                            onChange={(e) => setData('id_guru', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/50 placeholder:text-gray-400"
                                            placeholder="Contoh: G001"
                                        />
                                    </div>
                                    {errors.id_guru && (
                                        <p className="text-red-500 text-xs mt-1">{errors.id_guru}</p>
                                    )}
                                </div>

                                {/* NIP */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        NIP <span className="text-gray-400 font-normal">(Opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.nip}
                                            onChange={(e) => setData('nip', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/50 placeholder:text-gray-400"
                                            placeholder="Nomor Induk Pegawai"
                                        />
                                    </div>
                                    {errors.nip && (
                                        <p className="text-red-500 text-xs mt-1">{errors.nip}</p>
                                    )}
                                </div>

                                {/* Nama Lengkap */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nama Lengkap <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.nama_lengkap}
                                            onChange={(e) => setData('nama_lengkap', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/50 placeholder:text-gray-400"
                                            placeholder="Nama lengkap beserta gelar"
                                        />
                                    </div>
                                    {errors.nama_lengkap && (
                                        <p className="text-red-500 text-xs mt-1">{errors.nama_lengkap}</p>
                                    )}
                                </div>

                                {/* Jenis Kelamin */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Kelamin</label>
                                    <div className="relative">
                                        <select
                                            value={data.jenis_kelamin}
                                            onChange={(e) => setData('jenis_kelamin', e.target.value)}
                                            className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/50 appearance-none cursor-pointer"
                                        >
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Kepegawaian</label>
                                    <div className="relative">
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/50 appearance-none cursor-pointer"
                                        >
                                            <option value="Aktif">Aktif</option>
                                            <option value="Tidak Aktif">Tidak Aktif</option>
                                            <option value="Pensiun">Pensiun</option>
                                        </select>
                                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Akun Otomatis */}
                            <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-start gap-4 shadow-inner">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900 mb-1">Informasi Akun Otomatis</h4>
                                    <p className="text-xs text-blue-700/80 leading-relaxed mb-2">
                                        Sistem akan membuatkan akun login secara otomatis dengan detail berikut:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-200/50">
                                            <span className="text-blue-500 font-medium">Username:</span>{' '}
                                            <code className="text-blue-800 font-semibold">guru#[nama_tanpa_spasi]</code>
                                            <span className="text-blue-400 ml-1">(contoh: guru#ahmad)</span>
                                        </div>
                                        <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-200/50">
                                            <span className="text-blue-500 font-medium">Password Default:</span>{' '}
                                            <code className="text-blue-800 font-semibold">alhawari#cibiuk</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}