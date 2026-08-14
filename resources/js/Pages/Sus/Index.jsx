import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import GuruLayout from '@/Layouts/GuruLayout';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import Swal from 'sweetalert2';

const questions = [
    { id: 'q1', text: '1. Saya pikir saya akan sering menggunakan sistem presensi ini.', type: 'Positif' },
    { id: 'q2', text: '2. Saya merasa sistem presensi ini terlalu rumit padahal bisa dibuat lebih sederhana.', type: 'Negatif' },
    { id: 'q3', text: '3. Saya merasa sistem presensi ini mudah digunakan.', type: 'Positif' },
    { id: 'q4', text: '4. Saya merasa butuh bantuan teknisi/guru untuk bisa menggunakan sistem ini.', type: 'Negatif' },
    { id: 'q5', text: '5. Saya menemukan bahwa berbagai fungsi di sistem ini terintegrasi dengan baik.', type: 'Positif' },
    { id: 'q6', text: '6. Saya merasa ada banyak hal yang tidak konsisten pada sistem ini.', type: 'Negatif' },
    { id: 'q7', text: '7. Saya merasa mayoritas siswa dapat belajar menggunakan sistem ini dengan sangat cepat.', type: 'Positif' },
    { id: 'q8', text: '8. Saya merasa sistem presensi ini sangat tidak praktis / merepotkan untuk digunakan.', type: 'Negatif' },
    { id: 'q9', text: '9. Saya merasa sangat yakin pada diri saya sendiri saat menggunakan sistem ini.', type: 'Positif' },
    { id: 'q10', text: '10. Saya harus banyak belajar hal baru terlebih dahulu sebelum bisa menggunakan sistem ini.', type: 'Negatif' }
];

export default function SusIndex({ existingSus, userRole }) {
    const { data, setData, post, processing, errors } = useForm({
        q1: existingSus?.q1 || '',
        q2: existingSus?.q2 || '',
        q3: existingSus?.q3 || '',
        q4: existingSus?.q4 || '',
        q5: existingSus?.q5 || '',
        q6: existingSus?.q6 || '',
        q7: existingSus?.q7 || '',
        q8: existingSus?.q8 || '',
        q9: existingSus?.q9 || '',
        q10: existingSus?.q10 || '',
    });

    const { flash } = usePage().props;
    React.useEffect(() => {
        if (flash.success) {
            Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success', confirmButtonText: 'Tutup' });
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        let prefix = 'siswa.';
        if (userRole === 'Guru') prefix = 'guru.';
        if (userRole === 'Orang Tua') prefix = 'orangtua.';
        
        post(route(`${prefix}sus.store`), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    let LayoutComponent = SiswaLayout;
    if (userRole === 'Guru') LayoutComponent = GuruLayout;
    if (userRole === 'Orang Tua') LayoutComponent = OrangTuaLayout;

    return (
        <LayoutComponent header="Kuesioner System Usability Scale (SUS)">
            <Head title="Kuesioner SUS" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Evaluasi Usability Sistem</h3>
                            <p className="text-gray-600 text-sm">
                                Silakan isi 10 pernyataan di bawah ini berdasarkan pengalaman Anda menggunakan sistem. 
                                Skala 1 = Sangat Tidak Setuju, hingga 5 = Sangat Setuju.
                            </p>
                            {existingSus && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-green-800 text-sm font-semibold">
                                        Anda sudah mengisi kuesioner ini dengan Skor SUS: <span className="text-xl font-bold">{existingSus.skor_sus}</span>
                                    </p>
                                    <p className="text-green-700 text-xs mt-1">Anda dapat mengubah jawaban Anda di bawah ini dan mensubmit ulang.</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {questions.map((q) => (
                                <div key={q.id} className="border-b border-gray-100 pb-4">
                                    <label className="block text-sm font-medium text-gray-800 mb-3">{q.text}</label>
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-8">
                                        <span className="text-xs text-gray-500 font-medium hidden sm:block">Sangat Tidak Setuju</span>
                                        <div className="flex space-x-6">
                                            {[1, 2, 3, 4, 5].map((val) => (
                                                <label key={val} className="flex flex-col items-center space-y-1 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value={val}
                                                        checked={data[q.id] == val}
                                                        onChange={(e) => setData(q.id, e.target.value)}
                                                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                        required
                                                    />
                                                    <span className="text-xs text-gray-700">{val}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium hidden sm:block">Sangat Setuju</span>
                                    </div>
                                    {errors[q.id] && <p className="text-red-500 text-xs mt-1">{errors[q.id]}</p>}
                                </div>
                            ))}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Kuesioner SUS'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}
