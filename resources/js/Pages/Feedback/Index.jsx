import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import GuruLayout from '@/Layouts/GuruLayout';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export default function FeedbackIndex({ existingFeedback, userRole }) {
    const { data, setData, post, processing, errors } = useForm({
        rating: existingFeedback?.rating || 0,
        komentar: existingFeedback?.komentar || '',
    });

    const [hoverRating, setHoverRating] = useState(0);

    // Sweetalert for flash success
    const { flash } = usePage().props;
    React.useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: flash.success,
                icon: 'success',
                confirmButtonText: 'Tutup'
            });
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        let prefix = 'siswa.';
        if (userRole === 'Guru') prefix = 'guru.';
        if (userRole === 'Orang Tua') prefix = 'orangtua.';
        
        post(route(`${prefix}feedback.store`), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // Render logic to pick the correct Layout based on User Role
    let LayoutComponent = SiswaLayout; // fallback
    let headerTitle = "Feedback Pengguna";

    if (userRole === 'Guru') {
        LayoutComponent = GuruLayout;
    } else if (userRole === 'Orang Tua') {
        LayoutComponent = OrangTuaLayout;
    }

    return (
        <LayoutComponent header={headerTitle}>
            <Head title="Feedback Sistem" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Penilaian Sistem & Umpan Balik</h3>
                            <p className="text-gray-600 text-sm">
                                Masukan Anda sangat berarti bagi kami untuk meningkatkan kualitas layanan dan fitur dalam sistem presensi dan akademik ini. 
                                Silakan berikan penilaian (rating) dan komentar (saran/kritik) terhadap sistem.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                            {/* Rating Stars */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating Sistem (1 - 5 Bintang) <span className="text-red-500">*</span></label>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setData('rating', star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none"
                                        >
                                            {(hoverRating || data.rating) >= star ? (
                                                <StarIcon className="w-10 h-10 text-yellow-400" />
                                            ) : (
                                                <StarOutline className="w-10 h-10 text-gray-300" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                            </div>

                            {/* Komentar */}
                            <div>
                                <label htmlFor="komentar" className="block text-sm font-medium text-gray-700 mb-2">
                                    Komentar / Saran / Kritik (Opsional)
                                </label>
                                
                                {userRole === 'Siswa' && (
                                    <select 
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mb-3 text-sm text-gray-700 bg-gray-50"
                                        onChange={(e) => {
                                            if (e.target.value && e.target.value !== 'Pilih tanggapan cepat...') {
                                                setData('komentar', e.target.value);
                                            }
                                        }}
                                        defaultValue="Pilih tanggapan cepat..."
                                    >
                                        <option disabled>Pilih tanggapan cepat...</option>
                                        <option value="Tidak ada keluhan, sistem berjalan dengan sangat baik.">Tidak ada keluhan, sistem berjalan dengan sangat baik.</option>
                                        <option value="Aplikasi sangat mudah dipahami dan digunakan.">Aplikasi sangat mudah dipahami dan digunakan.</option>
                                        <option value="Aplikasi tidak berat dan cepat saat dibuka.">Aplikasi tidak berat dan cepat saat dibuka.</option>
                                        <option value="Menurut saya sudah sangat sempurna untuk sistem presensi.">Menurut saya sudah sangat sempurna untuk sistem presensi.</option>
                                        <option value="Sangat membantu, apalagi ada notifikasi jika berhasil absen.">Sangat membantu, apalagi ada notifikasi jika berhasil absen.</option>
                                        <option value="Tampilannya menarik dan tidak membingungkan.">Tampilannya menarik dan tidak membingungkan.</option>
                                        <option value="Simpel dan to-the-point, saya suka desainnya.">Simpel dan to-the-point, saya suka desainnya.</option>
                                        <option value="Desain antarmuka rapi dan enak dipandang.">Desain antarmuka rapi dan enak dipandang.</option>
                                        <option value="Fitur lokasi (geolocation) sangat akurat dan cepat.">Fitur lokasi (geolocation) sangat akurat dan cepat.</option>
                                    </select>
                                )}

                                <textarea
                                    id="komentar"
                                    rows="4"
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    placeholder="Tuliskan pengalaman Anda menggunakan sistem ini, apa yang sudah bagus, atau apa yang perlu diperbaiki..."
                                    value={data.komentar}
                                    onChange={(e) => setData('komentar', e.target.value)}
                                ></textarea>
                                {errors.komentar && <p className="text-red-500 text-xs mt-1">{errors.komentar}</p>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || data.rating === 0}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Kirim Feedback'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}
