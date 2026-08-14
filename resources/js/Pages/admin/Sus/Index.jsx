import React, { useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { CheckCircleIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function AdminSusIndex({ evaluations, stats }) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ["evaluations", "stats"], preserveScroll: true, preserveState: true });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const { averageScore, totalResponden, grade, acceptability } = stats;

    return (
        <AdminLayout header="Rekapitulasi System Usability Scale (SUS)">
            <Head title="Admin - Rekap SUS" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Stats Widget */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-sm font-medium text-gray-500 mb-1">Rata-rata Skor SUS</span>
                            <span className="text-4xl font-black text-indigo-600">{averageScore}</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-sm font-medium text-gray-500 mb-1">Total Responden</span>
                            <span className="text-4xl font-black text-gray-800">{totalResponden}</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-sm font-medium text-gray-500 mb-1">Grade Scale</span>
                            <span className={`text-4xl font-black ${grade === "A" ? "text-green-500" : grade === "B/C" ? "text-blue-500" : "text-red-500"}`}>{grade}</span>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-sm font-medium text-gray-500 mb-1">Acceptability Range</span>
                            <span className={`text-2xl font-black ${acceptability === "Acceptable" ? "text-green-500" : "text-yellow-500"}`}>{acceptability}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Detail Hasil Evaluasi SUS</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Nama Responden</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3 text-center">Q1 - Q10</th>
                                        <th className="px-6 py-3 text-center">Skor Akhir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {evaluations.length > 0 ? (
                                        evaluations.map((fb) => (
                                            <tr key={fb.id_kuesioner} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {fb.pengguna?.nama_lengkap || "User Tidak Ditemukan"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {fb.pengguna?.level || "Unknown"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center space-x-1">
                                                        {[fb.q1, fb.q2, fb.q3, fb.q4, fb.q5, fb.q6, fb.q7, fb.q8, fb.q9, fb.q10].map((q, i) => (
                                                            <span key={i} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-600" title={`Q${i+1}`}>
                                                                {q}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-indigo-600">
                                                    {fb.skor_sus}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                Belum ada responden yang mengisi kuesioner SUS.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
