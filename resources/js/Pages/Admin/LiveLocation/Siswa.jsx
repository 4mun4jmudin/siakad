import React, { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { Users, Wifi, Clock, XCircle, MapPin } from 'lucide-react';

const createIcon = (color) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
};

const icons = {
    online: createIcon('#10b981'), // emerald-500
    idle: createIcon('#f59e0b'),   // amber-500
    offline: createIcon('#ef4444'),// red-500
};

export default function AdminLiveLocationSiswa({ auth, sekolah }) {
    const [locations, setLocations] = useState([]);
    const [stats, setStats] = useState({ total: 0, online: 0, idle: 0, offline: 0 });
    
    const schoolLat = parseFloat(sekolah?.lokasi_sekolah_latitude || '-6.200000');
    const schoolLng = parseFloat(sekolah?.lokasi_sekolah_longitude || '106.816666');
    const radius = parseFloat(sekolah?.radius_absen_meters || 200);

    const fetchLocations = async () => {
        try {
            const response = await axios.get(route('admin.live-location.siswa'));
            if (response.data.success) {
                const data = response.data.data;
                setLocations(data);
                
                setStats({
                    total: data.length,
                    online: data.filter(l => l.status === 'online').length,
                    idle: data.filter(l => l.status === 'idle').length,
                    offline: data.filter(l => l.status === 'offline').length,
                });
            }
        } catch (error) {
            console.error('Gagal mengambil data live location:', error);
        }
    };

    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout user={auth.user} header="Live Lokasi Siswa" subtitle="Pemantauan realtime GPS siswa aktif di area sekolah.">
            <Head title="Live Lokasi Siswa" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Total Terlacak</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><Wifi className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Online</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.online}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
                        <div className="bg-amber-50 text-amber-600 p-3 rounded-xl"><Clock className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Idle</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.idle}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
                        <div className="bg-rose-50 text-rose-600 p-3 rounded-xl"><XCircle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500">Offline</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.offline}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="h-[600px] w-full relative z-0">
                        <MapContainer 
                            center={[schoolLat, schoolLng]} 
                            zoom={16} 
                            style={{ height: '100%', width: '100%', zIndex: 0 }}
                        >
                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                            
                            <Circle 
                                center={[schoolLat, schoolLng]} 
                                radius={radius} 
                                pathOptions={{ color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 0.15, weight: 2 }} 
                            />
                            
                            <Marker position={[schoolLat, schoolLng]} icon={createIcon('#3b82f6')}>
                                <Popup>Titik Pusat Sekolah</Popup>
                            </Marker>

                            {locations.map((loc) => (
                                loc.latitude && loc.longitude && (
                                    <Marker 
                                        key={loc.id_siswa} 
                                        position={[loc.latitude, loc.longitude]}
                                        icon={icons[loc.status] || icons.offline}
                                    >
                                        <Popup className="rounded-xl">
                                            <div className="font-sans min-w-[200px]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-2 h-2 rounded-full ${loc.status === 'online' ? 'bg-emerald-500' : loc.status === 'idle' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{loc.status}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-base">{loc.nama_lengkap}</h4>
                                                <p className="text-sm text-slate-600 mb-3">{loc.nis} • {loc.kelas}</p>
                                                
                                                <div className="bg-slate-50 rounded-lg p-2 text-xs space-y-1 border border-slate-100">
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-slate-500">Koordinat:</span>
                                                        <span className="font-semibold text-slate-700 select-all truncate">{loc.latitude}, {loc.longitude}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-slate-500">Akurasi GPS:</span>
                                                        <span className="font-semibold text-slate-700">{loc.accuracy}m</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-slate-500">Jarak ke Sekolah:</span>
                                                        <span className="font-semibold text-slate-700">{loc.distance_meters !== null ? `${loc.distance_meters}m` : '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-slate-500">Update:</span>
                                                        <span className="font-semibold text-slate-700">{loc.seconds_ago} detik lalu</span>
                                                    </div>
                                                </div>

                                                <a 
                                                    href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-lg text-xs font-semibold transition-colors"
                                                >
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    Buka di Google Maps
                                                </a>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
