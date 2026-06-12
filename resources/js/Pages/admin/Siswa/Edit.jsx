import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import SiswaForm from './Partials/SiswaForm';

export default function Edit({ auth, siswa, kelasOptions }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        nis: siswa.nis || '',
        nisn: siswa.nisn || '',
        id_kelas: siswa.id_kelas || '',
        nama_lengkap: siswa.nama_lengkap || '',
        nama_panggilan: siswa.nama_panggilan || '',
        foto_profil: null,
        nik: siswa.nik || '',
        nomor_kk: siswa.nomor_kk || '',
        tempat_lahir: siswa.tempat_lahir || '',
        tanggal_lahir: siswa.tanggal_lahir || '',
        jenis_kelamin: siswa.jenis_kelamin || 'Laki-laki',
        agama: siswa.agama || 'Islam',
        alamat_lengkap: siswa.alamat_lengkap || '',
        anak_ke: siswa.anak_ke || '',
        jumlah_saudara: siswa.jumlah_saudara || '',
        sekolah_asal: siswa.sekolah_asal || '',
        tahun_lulus: siswa.tahun_lulus || '',
        nama_ayah: siswa.nama_ayah || '',
        nik_ayah: siswa.nik_ayah || '',
        pendidikan_ayah: siswa.pendidikan_ayah || '',
        pekerjaan_ayah: siswa.pekerjaan_ayah || '',
        penghasilan_ayah: siswa.penghasilan_ayah || '',
        nama_ibu: siswa.nama_ibu || '',
        nik_ibu: siswa.nik_ibu || '',
        pendidikan_ibu: siswa.pendidikan_ibu || '',
        pekerjaan_ibu: siswa.pekerjaan_ibu || '',
        penghasilan_ibu: siswa.penghasilan_ibu || '',
        nama_wali: siswa.nama_wali || '',
        no_hp_wali: siswa.no_hp_wali || '',
        alamat_wali: siswa.alamat_wali || '',
        status: siswa.status || 'Aktif',
        sidik_jari_template: siswa.sidik_jari_template || null,
        barcode_id: siswa.barcode_id || '',
        rt: siswa.rt || '',
        rw: siswa.rw || '',
        dusun: siswa.dusun || '',
        kelurahan: siswa.kelurahan || '',
        kecamatan: siswa.kecamatan || '',
        kode_pos: siswa.kode_pos || '',
        jenis_tinggal: siswa.jenis_tinggal || '',
        alat_transportasi: siswa.alat_transportasi || '',
        jarak_rumah_ke_sekolah: siswa.jarak_rumah_ke_sekolah || '',
        lintang: siswa.lintang || '',
        bujur: siswa.bujur || '',
        telepon_siswa: siswa.telepon_siswa || '',
        hp_siswa: siswa.hp_siswa || '',
        email_siswa: siswa.email_siswa || '',
        skhun: siswa.skhun || '',
        no_peserta_ujian_nasional: siswa.no_peserta_ujian_nasional || '',
        no_seri_ijazah: siswa.no_seri_ijazah || '',
        no_registrasi_akta_lahir: siswa.no_registrasi_akta_lahir || '',
        penerima_kps: siswa.penerima_kps || '',
        no_kps: siswa.no_kps || '',
        penerima_kip: siswa.penerima_kip || '',
        nomor_kip: siswa.nomor_kip || '',
        nama_di_kip: siswa.nama_di_kip || '',
        nomor_kks: siswa.nomor_kks || '',
        layak_pip: siswa.layak_pip || '',
        alasan_layak_pip: siswa.alasan_layak_pip || '',
        bank: siswa.bank || '',
        nomor_rekening_bank: siswa.nomor_rekening_bank || '',
        rekening_atas_nama: siswa.rekening_atas_nama || '',
        kebutuhan_khusus: siswa.kebutuhan_khusus || '',
        berat_badan: siswa.berat_badan || '',
        tinggi_badan: siswa.tinggi_badan || '',
        lingkar_kepala: siswa.lingkar_kepala || '',
        tahun_lahir_ayah: siswa.tahun_lahir_ayah || '',
        tahun_lahir_ibu: siswa.tahun_lahir_ibu || '',
        tahun_lahir_wali: siswa.tahun_lahir_wali || '',
        pendidikan_wali: siswa.pendidikan_wali || '',
        pekerjaan_wali: siswa.pekerjaan_wali || '',
        penghasilan_wali: siswa.penghasilan_wali || '',
        nik_wali: siswa.nik_wali || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // DEBUG: Log form data
        console.log('Form submission started', {
            hasPhoto: data.foto_profil !== null,
            photoName: data.foto_profil?.name || 'No file',
            photoSize: data.foto_profil?.size || 0,
            formData: data,
        });

        setIsSubmitting(true);
        
        post(route('admin.siswa.update', siswa.id_siswa), {
            forceFormData: true,  // PENTING: Untuk file upload
            preserveScroll: true,
            onSuccess: () => {
                console.log('Form submitted successfully');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error('Form submission error', errors);
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AdminLayout user={auth.user} header="Edit Siswa">
            <Head title="Edit Siswa" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <SiswaForm 
                        data={data} 
                        setData={setData} 
                        errors={errors} 
                        kelasOptions={kelasOptions} 
                        siswa={siswa}
                    />
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        type="submit" 
                        className="px-4 py-2 bg-gray-800 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={processing || isSubmitting}
                    >
                        {processing || isSubmitting ? 'Memproses...' : 'Update'}
                    </button>
                    <Link 
                        href={route('admin.siswa.index')} 
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        Batal
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
