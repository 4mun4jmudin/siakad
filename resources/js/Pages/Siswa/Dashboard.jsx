// resources/js/Pages/Siswa/Dashboard.jsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import SiswaLayout from '@/Layouts/SiswaLayout';
import {
  Activity,
  AlertTriangle,
  Ban,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  LocateFixed,
  LogOut,
  Map,
  MapPin,
  Navigation,
  RefreshCw,
  School,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Wifi,
  X,
  BookOpen,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

let googleMapsLoaderPromise = null;

function safeRoute(name, params = {}, fallback = '#') {
  try {
    if (typeof route === 'function') return route(name, params);
    if (typeof window !== 'undefined' && typeof window.route === 'function') {
      return window.route(name, params);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window tidak tersedia.'));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key belum diset.'));
  }

  if (googleMapsLoaderPromise) {
    return googleMapsLoaderPromise;
  }

  googleMapsLoaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-maps-script="true"]');

    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      existing.addEventListener('error', () => reject(new Error('Gagal memuat Google Maps.')));
      return;
    }

    const script = document.createElement('script');
    script.dataset.googleMapsScript = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Gagal memuat Google Maps.'));

    document.head.appendChild(script);
  });

  return googleMapsLoaderPromise;
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getNetworkSnapshot() {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    null;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType || null,
    downlink: connection?.downlink || null,
    rtt: connection?.rtt || null,
    saveData: connection?.saveData || false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    language: navigator.language || null,
    languages: navigator.languages || [],
    platform: navigator.platform || null,
    userAgent: navigator.userAgent || null,
    screen: {
      width: window.screen?.width || null,
      height: window.screen?.height || null,
      pixelRatio: window.devicePixelRatio || null,
    },
  };
}

function formatTime(timeStr) {
  if (!timeStr) return '-';

  try {
    if (String(timeStr).includes(':') && !String(timeStr).includes('T')) {
      const [hour, minute] = String(timeStr).split(':');
      return `${hour}:${minute}`;
    }

    if (String(timeStr).includes('T')) {
      return new Date(timeStr).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const date = new Date(`1970-01-01T${timeStr}`);

    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timeStr;
  }
}

function avatarFallback(name = 'Siswa') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=ffffff&bold=true`;
}

function getNamaKelas(siswa = {}) {
  const kelas = siswa?.kelas;

  if (!kelas) return 'Siswa';
  if (kelas?.nama_kelas) return kelas.nama_kelas;

  return [kelas?.tingkat, kelas?.jurusan].filter(Boolean).join(' ') || 'Siswa';
}

function statusMeta(status) {
  const map = {
    Hadir: {
      label: 'Hadir',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500',
    },
    Sakit: {
      label: 'Sakit',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
    },
    Izin: {
      label: 'Izin',
      className: 'border-sky-200 bg-sky-50 text-sky-700',
      dot: 'bg-sky-500',
    },
    Alfa: {
      label: 'Alfa',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
      dot: 'bg-rose-500',
    },
    Tuntas: {
      label: 'Tuntas',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500',
    },
    'Di Sekolah': {
      label: 'Di Sekolah',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
    },
    'Belum Hadir': {
      label: 'Belum Hadir',
      className: 'border-slate-200 bg-slate-50 text-slate-600',
      dot: 'bg-slate-400',
    },
  };

  return map[status] || {
    label: status || 'Belum Hadir',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
    dot: 'bg-slate-400',
  };
}

function getPrecisePosition({ desiredAccuracy = 50, timeout = 15000 } = {}) {
  let watchId = null;
  let timer = null;
  let best = null;
  let resolved = false;
  let rejectFn;

  const promise = new Promise((resolve, reject) => {
    rejectFn = reject;

    if (!navigator.geolocation) {
      reject(new Error('Browser tidak mendukung GPS.'));
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Anti-Fake GPS Heuristic
        const c = position.coords;
        const isMocked = position.mocked || c.mocked;
        const isSuspiciousFake = 
          (c.altitude === 0 || c.altitude === null) &&
          (c.altitudeAccuracy === 0 || c.altitudeAccuracy === null) &&
          (c.heading === 0 || c.heading === null || Number.isNaN(c.heading)) &&
          (c.speed === 0 || c.speed === null);

        // Jika terdeteksi properti mocked OS, atau
        // Akurasi bulat sempurna tanpa goyangan desimal (misal 5, 10) + data satelit 100% kosong
        const isPerfectRound = c.accuracy % 1 === 0 && c.accuracy <= 20;

        if (isMocked || (isSuspiciousFake && isPerfectRound)) {
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          if (timer) clearTimeout(timer);
          
          resolved = true;
          reject(new Error('Akses ditolak: Terdeteksi penggunaan Fake GPS / Lokasi Palsu.'));
          return;
        }

        if (!best || position.coords.accuracy < best.coords.accuracy) {
          best = position;
        }

        if (position.coords.accuracy <= desiredAccuracy) {
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          if (timer) clearTimeout(timer);

          resolved = true;
          resolve(position);
        }
      },
      (error) => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        if (timer) clearTimeout(timer);

        resolved = true;
        reject(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );

    timer = setTimeout(() => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);

      if (best) {
        resolved = true;
        resolve(best);
      } else {
        resolved = true;
        reject(new Error('Timeout membaca lokasi.'));
      }
    }, timeout);
  });

  return {
    promise,
    stop: () => {
      try {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      } catch { }

      if (!resolved && rejectFn) {
        rejectFn(new Error('Pencarian lokasi dibatalkan.'));
      }

      if (timer) clearTimeout(timer);
    },
  };
}

const PremiumCard = React.memo(function PremiumCard({ children, className = '', delay = 0 }) {
  return (
    <div
      className={cn(
        'animate-soft-rise rounded-[2rem] border border-white/70 bg-white/90',
        'shadow-[0_22px_70px_-42px_rgba(15,23,42,0.7)] backdrop-blur-xl',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_32px_80px_-44px_rgba(15,23,42,0.8)]',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
});

const StatusBadge = React.memo(function StatusBadge({ status, className = '' }) {
  const meta = statusMeta(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide',
        meta.className,
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
});

const HeroStat = React.memo(function HeroStat({ label, value, icon: Icon, tone = 'cyan' }) {
  const tones = {
    cyan: 'text-cyan-100',
    emerald: 'text-emerald-200',
    amber: 'text-amber-200',
    rose: 'text-rose-200',
  };

  return (
    <div className="rounded-3xl border border-white/20 bg-white/15 p-3 text-center backdrop-blur-md">
      <Icon className={cn('mx-auto h-5 w-5', tones[tone] || tones.cyan)} />

      <p className="mt-2 text-2xl font-black leading-none text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/80">
        {label}
      </p>
    </div>
  );
});

const MetricCard = React.memo(function MetricCard({ label, value, icon: Icon, tone = 'cyan', hint = null }) {
  const tones = {
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  };

  return (
    <PremiumCard className="p-4" delay={80}>
      <div className="flex items-start gap-3">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', tones[tone] || tones.cyan)}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-lg font-black text-slate-900">
            {value}
          </p>

          {hint && (
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
              {hint}
            </p>
          )}
        </div>
      </div>
    </PremiumCard>
  );
});

const DigitalClock = React.memo(function DigitalClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden py-7">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100/80 blur-3xl" />

      <div className="relative font-mono text-5xl font-black tracking-tighter text-slate-950 drop-shadow-sm sm:text-7xl">
        {now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </div>

      <div className="relative mt-3 rounded-full border border-slate-200/80 bg-white/85 px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-slate-500 shadow-sm backdrop-blur-xl">
        {now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </div>
    </div>
  );
});

const Toast = React.memo(function Toast({ show, type = 'success', message, onClose }) {
  useEffect(() => {
    if (!show) return undefined;

    const timeoutId = setTimeout(() => onClose(), 3600);
    return () => clearTimeout(timeoutId);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-5 z-[120] w-full max-w-sm -translate-x-1/2 px-4">
      <div
        className={cn(
          'animate-toast-in pointer-events-auto flex items-start gap-3 rounded-3xl px-5 py-4 text-white shadow-2xl',
          type === 'success'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-900/20'
            : 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-900/20'
        )}
      >
        {type === 'success' ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
        )}

        <span className="text-sm font-bold leading-relaxed">
          {message}
        </span>
      </div>
    </div>
  );
});

function SmartGoogleMap({
  schoolLat,
  schoolLng,
  studentCoords,
  radius = 200,
  small = true,
  centerMode = 'school',
  distanceToSchool = null,
  liveTracking = false,
  networkSnapshot = null,
  onRequestLocation,
  onStopTracking,
  onOpenFullMap,
}) {
  const [components, setComponents] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [hasCentered, setHasCentered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    let mounted = true;
    (async () => {
      try {
        const mod = await import('react-leaflet');
        const L = await import('leaflet');
        try {
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });
        } catch (e) { }
        if (!mounted) return;
        setComponents({
          MapContainer: mod.MapContainer,
          TileLayer: mod.TileLayer,
          Marker: mod.Marker,
          Popup: mod.Popup,
          Circle: mod.Circle,
          Polyline: mod.Polyline,
          useMap: mod.useMap
        });
      } catch (err) {
        console.warn('react-leaflet not available', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const schoolCenter = schoolLat && schoolLng ? [parseFloat(schoolLat), parseFloat(schoolLng)] : null;
  const studentCenter = studentCoords && typeof studentCoords.latitude === 'number'
      ? [studentCoords.latitude, studentCoords.longitude]
      : null;

  const center = centerMode === 'student' && studentCenter ? studentCenter : schoolCenter || studentCenter;
  const allowedRadius = parseInt(radius || 200, 10);
  const isInside = distanceToSchool !== null ? Number(distanceToSchool) <= allowedRadius : null;

  const heightClass = small ? 'h-[360px]' : 'h-full';

  // Component to handle dynamic center panning
  const MapEffect = ({ components }) => {
    const map = components.useMap();
    useEffect(() => {
      if (!mapInstance) setMapInstance(map);
    }, [map]);
    return null;
  };

  useEffect(() => {
    if (mapInstance && center && !hasCentered) {
      mapInstance.setView(center, 17, { animate: false });
      setHasCentered(true);
    }
  }, [mapInstance, center, hasCentered]);

  const handleRecenter = () => {
    if (mapInstance) {
      const targetCenter = studentCenter || schoolCenter || center;
      if (targetCenter) {
        mapInstance.setView(targetCenter, 17, { animate: true });
      }
    }
  };

  if (!components) {
    return (
      <div className={cn(heightClass, 'relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100')}>
         <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
            Memuat Peta...
         </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } = components;

  return (
    <div className={cn(heightClass, 'relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-inner')}>
      <div className="h-full w-full absolute inset-0 z-0">
        <MapContainer center={center || [0,0]} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          <MapEffect components={components} />
          {schoolCenter && (
            <>
              <Marker position={schoolCenter}>
                <Popup>Titik Sekolah</Popup>
              </Marker>
              <Circle center={schoolCenter} radius={allowedRadius} pathOptions={{ color: '#0284c7', fillColor: '#06b6d4', fillOpacity: 0.12, weight: 2 }} />
            </>
          )}
          {studentCenter && (
            <>
              <Marker position={studentCenter}>
                <Popup>Lokasi Anda</Popup>
              </Marker>
              <Circle center={studentCenter} radius={Math.max(10, studentCoords.accuracy || 30)} pathOptions={{ color: isInside === false ? '#e11d48' : '#10b981', fillOpacity: 0.15, weight: 2 }} />
            </>
          )}
          {schoolCenter && studentCenter && (
             <Polyline positions={[schoolCenter, studentCenter]} pathOptions={{ color: isInside === false ? '#e11d48' : '#06b6d4', weight: 4, dashArray: '5, 5' }} />
          )}
        </MapContainer>
      </div>

      <div className="absolute left-3 right-3 top-3 z-[10] grid grid-cols-2 gap-2 lg:grid-cols-4 pointer-events-none">
        <div className="rounded-2xl border border-white/20 bg-slate-950/75 px-3 py-2 text-white shadow-xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-wide text-cyan-200">Status GPS</p>
          <p className="mt-0.5 text-xs font-black">
            {liveTracking ? 'Realtime Aktif' : studentCoords ? 'Terkunci' : 'Belum Aktif'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-slate-950/75 px-3 py-2 text-white shadow-xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-wide text-cyan-200">Jarak</p>
          <p className={cn('mt-0.5 text-xs font-black', isInside === false ? 'text-rose-300' : 'text-emerald-300')}>
            {distanceToSchool !== null ? `${distanceToSchool}m` : '-'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-slate-950/75 px-3 py-2 text-white shadow-xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-wide text-cyan-200">Akurasi</p>
          <p className="mt-0.5 text-xs font-black">
            {studentCoords?.accuracy ? `${studentCoords.accuracy}m` : '-'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-slate-950/75 px-3 py-2 text-white shadow-xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-wide text-cyan-200">Radius</p>
          <p className="mt-0.5 text-xs font-black">{allowedRadius}m</p>
        </div>
      </div>

      {networkSnapshot && (
        <div className="absolute right-3 top-[142px] z-[10] hidden max-w-[230px] rounded-2xl border border-white/20 bg-slate-950/75 px-3 py-2 text-white shadow-xl backdrop-blur-xl lg:block pointer-events-none">
          <p className="text-[9px] font-black uppercase tracking-wide text-cyan-200">Network Hint</p>
          <p className="mt-1 text-xs font-bold">
            {networkSnapshot.effectiveType || 'unknown'} • RTT {networkSnapshot.rtt || '-'}ms
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-white/70">
            Tolak VPN tetap wajib dari server.
          </p>
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 z-[10] flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between pointer-events-none">
        <div
          className={cn(
            'rounded-2xl border px-4 py-3 text-sm font-black shadow-xl backdrop-blur-xl pointer-events-auto',
            isInside === false
              ? 'border-rose-200 bg-rose-50/95 text-rose-700'
              : isInside === true
                ? 'border-emerald-200 bg-emerald-50/95 text-emerald-700'
                : 'border-white/20 bg-white/95 text-slate-700'
          )}
        >
          {isInside === false
            ? 'Lokasi di luar radius sekolah'
            : isInside === true
              ? 'Lokasi valid dalam radius sekolah'
              : 'Sedang melacak lokasi realtime...'}
        </div>

        <div className="flex flex-wrap gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleRecenter}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-xl transition hover:bg-slate-50"
          >
            <LocateFixed className="h-5 w-5" />
            Pusatkan
          </button>

          {onOpenFullMap && (
            <button
              type="button"
              onClick={onOpenFullMap}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-xl transition hover:bg-slate-50"
            >
              <Map className="h-5 w-5" />
              Full Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function AttendanceProgress({ summary }) {
  const total = Math.max(Number(summary.total || 0), 1);
  const hadirPercent = Math.round((Number(summary.hadir || 0) / total) * 100);
  const izinSakitPercent = Math.round(((Number(summary.izin || 0) + Number(summary.sakit || 0)) / total) * 100);
  const alfaPercent = Math.round((Number(summary.alfa || 0) / total) * 100);

  return (
    <PremiumCard className="overflow-hidden p-0" delay={120}>
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-black text-slate-900">
                Performa Kehadiran
              </h2>

              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                Rekap berdasarkan 30 data riwayat terbaru.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
            {summary.total || 0} Data
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {[
          { label: 'Hadir', value: hadirPercent, className: 'bg-emerald-500' },
          { label: 'Izin/Sakit', value: izinSakitPercent, className: 'bg-sky-500' },
          { label: 'Alfa', value: alfaPercent, className: 'bg-rose-500' },
        ].map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs font-black uppercase tracking-wide">
              <span className="text-slate-500">{item.label}</span>
              <span className="text-slate-800">{item.value}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn('h-full rounded-full transition-all duration-700', item.className)}
                style={{ width: `${Math.min(item.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}

export default function SiswaDashboard({
  siswa = {},
  absensiHariIni = null,
  riwayatAbsensi = [],
  batasWaktuAbsen = null,
  pengaturanAbsensi: pengaturan = null,
  absensiMapelMingguIni = [],
}) {
  const { flash } = usePage().props;

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const [locationError, setLocationError] = useState('');
  const [coords, setCoords] = useState(null);
  const [distanceToSchool, setDistanceToSchool] = useState(null);
  const [networkSnapshot, setNetworkSnapshot] = useState(null);

  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isTooEarly, setIsTooEarly] = useState(false);
  const [earlyTimeStr, setEarlyTimeStr] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [mapCenterMode, setMapCenterMode] = useState('school');
  const [locating, setLocating] = useState(false);
  const [liveTracking, setLiveTracking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('month');

  const locateRequestRef = useRef(null);
  const liveWatchRef = useRef(null);
  const lastLiveSentRef = useRef(null);

  const sendLiveLocation = (nextCoords, distance) => {
    if (!nextCoords || distance === null) return;

    const now = Date.now();
    const lastSent = lastLiveSentRef.current;

    let shouldSend = false;
    if (!lastSent) {
      shouldSend = true;
    } else {
      const timeDiff = now - lastSent.time;
      const distDiff = Math.abs(distance - lastSent.distance);
      
      // Kirim jika lebih dari 10 detik atau berpindah 10 meter
      if (timeDiff >= 10000 || distDiff >= 10) {
        shouldSend = true;
      }
    }

    if (shouldSend) {
      lastLiveSentRef.current = {
        time: now,
        distance: distance,
        latitude: nextCoords.latitude,
        longitude: nextCoords.longitude,
      };

      const payload = {
        latitude: String(nextCoords.latitude),
        longitude: String(nextCoords.longitude),
        accuracy: String(nextCoords.accuracy),
        distance_to_school: String(distance),
        network_meta: JSON.stringify(getNetworkSnapshot()),
        location_meta: JSON.stringify({
          latitude: nextCoords.latitude,
          longitude: nextCoords.longitude,
          accuracy: nextCoords.accuracy,
          distance_to_school: distance,
          timestamp: now,
          source: 'browser_live_location'
        })
      };

      // Background Axios POST
      axios.post(safeRoute('siswa.lokasi.realtime'), payload)
        .catch((error) => {
          console.warn('Gagal mengirim live location:', error);
        });
    }
  };

  const profilePhotoUrl = siswa?.foto_profil_url || avatarFallback(siswa?.nama_lengkap || 'Siswa');
  const isCheckedIn = !!absensiHariIni;
  const isCheckedOut = absensiHariIni && !!absensiHariIni.jam_pulang;
  const kelasName = getNamaKelas(siswa);

  const todayStatus = isCheckedOut
    ? 'Tuntas'
    : isCheckedIn
      ? 'Di Sekolah'
      : 'Belum Hadir';

  const summary = useMemo(() => {
    const last30 = (riwayatAbsensi || []).slice(0, 30);

    return {
      hadir: last30.filter((item) => item.status_kehadiran === 'Hadir').length,
      sakit: last30.filter((item) => item.status_kehadiran === 'Sakit').length,
      izin: last30.filter((item) => item.status_kehadiran === 'Izin').length,
      alfa: last30.filter((item) => item.status_kehadiran === 'Alfa').length,
      total: last30.length,
    };
  }, [riwayatAbsensi]);

  const attendancePercent = summary.total
    ? Math.round((summary.hadir / summary.total) * 100)
    : 0;

  const filteredRiwayat = useMemo(() => {
    const list = riwayatAbsensi || [];

    if (!list.length) return [];

    const now = new Date();
    const daysLimit =
      historyFilter === 'week'
        ? 7
        : historyFilter === 'month'
          ? 30
          : 365;

    return list.filter((item) => {
      if (!item.tanggal) return false;

      const date = new Date(item.tanggal);
      const diffMs = now - date;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      return diffDays >= 0 && diffDays <= daysLimit;
    });
  }, [riwayatAbsensi, historyFilter]);

  useEffect(() => {
    if (flash?.success) {
      setToast({
        show: true,
        message: flash.success,
        type: 'success',
      });
    }

    if (flash?.error) {
      setToast({
        show: true,
        message: flash.error,
        type: 'error',
      });
    }
  }, [flash]);

  useEffect(() => {
    if (absensiHariIni?.jam_pulang) {
      setCoords(null);
      setDistanceToSchool(null);
      stopRealtimeTracking();
    }
  }, [absensiHariIni]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();

      if (absensiHariIni?.jam_pulang) {
        setIsTimeUp(false);
        setIsTooEarly(false);
        return;
      }

      if (absensiHariIni && !absensiHariIni.jam_pulang) {
        setIsTimeUp(false);

        if (pengaturan?.jam_pulang_siswa) {
          const [hour, minute] = pengaturan.jam_pulang_siswa.split(':').map(Number);
          const exitTime = new Date();
          exitTime.setHours(hour, minute || 0, 0, 0);

          const allowedTime = new Date(exitTime.getTime() - 15 * 60000);
          const startStr = allowedTime.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          });

          setEarlyTimeStr(startStr);
          setIsTooEarly(now < allowedTime);
        }

        return;
      }

      if (!absensiHariIni) {
        if (batasWaktuAbsen) {
          const [hour, minute] = batasWaktuAbsen.split(':').map(Number);
          const deadline = new Date();
          deadline.setHours(hour, minute || 0, 0, 0);

          setIsTimeUp(now > deadline);
        }

        if (pengaturan?.jam_masuk_siswa) {
          const [hour, minute] = pengaturan.jam_masuk_siswa.split(':').map(Number);
          const entryTime = new Date();
          entryTime.setHours(hour, minute || 0, 0, 0);

          const allowedTime = new Date(entryTime.getTime() - 15 * 60000);
          const startStr = allowedTime.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          });

          setEarlyTimeStr(startStr);
          setIsTooEarly(now < allowedTime);
        }
      }
    };

    checkTime();

    const intervalId = setInterval(checkTime, 10000);

    return () => clearInterval(intervalId);
  }, [batasWaktuAbsen, absensiHariIni, pengaturan]);

  useEffect(() => {
    return () => {
      if (liveWatchRef.current) {
        navigator.geolocation.clearWatch(liveWatchRef.current);
      }

      if (locateRequestRef.current) {
        locateRequestRef.current.stop();
      }
    };
  }, []);

  const previousIsInsideRef = useRef(null);

  useEffect(() => {
    if (distanceToSchool === null || !liveTracking) {
      previousIsInsideRef.current = null;
      return;
    }

    const allowedRadius = parseInt(pengaturan?.radius_absen_meters || 200, 10);
    const currentlyInside = distanceToSchool <= allowedRadius;

    if (previousIsInsideRef.current !== null && previousIsInsideRef.current !== currentlyInside) {
      if (currentlyInside) {
        setToast({
          show: true,
          message: `Berhasil MASUK jangkauan sekolah (${distanceToSchool}m). Silakan Absen!`,
          type: 'success',
        });
      } else {
        setToast({
          show: true,
          message: `Peringatan: KELUAR dari jangkauan sekolah (${distanceToSchool}m).`,
          type: 'error',
        });
      }
    }

    previousIsInsideRef.current = currentlyInside;
  }, [distanceToSchool, pengaturan?.radius_absen_meters, liveTracking]);

  const calculateDistance = (latitude, longitude) => {
    if (!pengaturan?.lokasi_sekolah_latitude || !pengaturan?.lokasi_sekolah_longitude) {
      return null;
    }

    return Math.round(
      getDistanceMeters(
        parseFloat(pengaturan.lokasi_sekolah_latitude),
        parseFloat(pengaturan.lokasi_sekolah_longitude),
        latitude,
        longitude
      )
    );
  };

  const updateLocationState = (position) => {
    const nextCoords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy || 0),
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      mocked: position.mocked || (position.coords && position.coords.mocked) || false,
    };

    const distance = calculateDistance(nextCoords.latitude, nextCoords.longitude);

    setCoords(nextCoords);
    setDistanceToSchool(distance);
    setMapCenterMode('student');

    sendLiveLocation(nextCoords, distance);

    return {
      coords: nextCoords,
      distance,
    };
  };

  const startRealtimeTracking = () => {
    setLocationError('');
    setNetworkSnapshot(getNetworkSnapshot());

    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung GPS.');
      return;
    }

    if (liveWatchRef.current) {
      navigator.geolocation.clearWatch(liveWatchRef.current);
    }

    setLiveTracking(true);
    setLocating(true);

    liveWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        // Anti-Fake GPS Heuristic
        const c = position.coords;
        const isMocked = position.mocked || c.mocked;
        const isSuspiciousFake = 
          (c.altitude === 0 || c.altitude === null) &&
          (c.altitudeAccuracy === 0 || c.altitudeAccuracy === null) &&
          (c.heading === 0 || c.heading === null || Number.isNaN(c.heading)) &&
          (c.speed === 0 || c.speed === null);

        const isPerfectRound = c.accuracy % 1 === 0 && c.accuracy <= 20;

        if (isMocked || (isSuspiciousFake && isPerfectRound)) {
          setLocating(false);
          setLiveTracking(false);
          setLocationError('Akses ditolak: Terdeteksi penggunaan Fake GPS / Lokasi Palsu.');
          setToast({
            show: true,
            message: 'Akses ditolak: Terdeteksi penggunaan Fake GPS / Lokasi Palsu.',
            type: 'error',
          });
          if (liveWatchRef.current) navigator.geolocation.clearWatch(liveWatchRef.current);
          return;
        }

        updateLocationState(position);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setLiveTracking(false);

        const message =
          error?.message ||
          'Gagal membaca lokasi. Pastikan izin lokasi aktif dan lokasi presisi menyala.';

        setLocationError(message);
        setToast({
          show: true,
          message,
          type: 'error',
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  };

  const stopRealtimeTracking = () => {
    if (liveWatchRef.current) {
      navigator.geolocation.clearWatch(liveWatchRef.current);
      liveWatchRef.current = null;
    }

    setLiveTracking(false);
    setLocating(false);
  };

  useEffect(() => {
    // Otomatis aktifkan GPS Realtime saat komponen dimount
    startRealtimeTracking();
    
    return () => {
      stopRealtimeTracking();
    };
  }, []);

  const cancelLocating = () => {
    if (locateRequestRef.current) {
      locateRequestRef.current.stop();
      locateRequestRef.current = null;
    }

    stopRealtimeTracking();

    setToast({
      show: true,
      message: 'Pencarian lokasi dibatalkan.',
      type: 'error',
    });
  };

  const handleAbsen = async (event) => {
    event?.preventDefault?.();

    setLocationError('');
    setToast({
      show: false,
      message: '',
      type: 'success',
    });

    const modeAbsen = absensiHariIni && !absensiHariIni.jam_pulang
      ? 'pulang'
      : 'masuk';

    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung GPS.');
      return;
    }

    let finalLat = coords?.latitude || null;
    let finalLng = coords?.longitude || null;
    let finalAcc = coords?.accuracy || null;
    let finalDistance = distanceToSchool;

    if (!finalLat || !finalLng) {
      setLocating(true);

      setToast({
        show: true,
        message: 'Mencari titik GPS presisi...',
        type: 'success',
      });

      try {
        const request = getPrecisePosition({
          desiredAccuracy: parseInt(pengaturan?.batas_akurasi_gps || 50, 10),
          timeout: 15000,
        });

        locateRequestRef.current = request;

        const position = await request.promise;
        const result = updateLocationState(position);

        finalLat = result.coords.latitude;
        finalLng = result.coords.longitude;
        finalAcc = result.coords.accuracy;
        finalDistance = result.distance;
      } catch (error) {
        setLocating(false);

        const message = error.message || 'Gagal mengunci GPS. Pastikan izin lokasi aktif.';

        setLocationError(message);
        setToast({
          show: true,
          message,
          type: 'error',
        });

        return;
      }
    }

    setLocating(false);
    locateRequestRef.current = null;

    const allowedRadius = parseInt(pengaturan?.radius_absen_meters || 200, 10);

    if (finalDistance !== null && finalDistance > allowedRadius) {
      setToast({
        show: true,
        message: `Lokasi ditolak. Jarak ${finalDistance}m, maksimal ${allowedRadius}m.`,
        type: 'error',
      });

      return;
    }

    const net = getNetworkSnapshot();
    setNetworkSnapshot(net);

    const payload = {
      latitude: String(finalLat),
      longitude: String(finalLng),
      accuracy: String(finalAcc),
      mode: modeAbsen,

      distance_to_school: finalDistance !== null ? String(finalDistance) : null,

      network_meta: JSON.stringify(net),
      location_meta: JSON.stringify({
        latitude: finalLat,
        longitude: finalLng,
        accuracy: finalAcc,
        distance_to_school: finalDistance,
        timestamp: Date.now(),
        gps_timestamp: coords?.timestamp || null,
        source: liveTracking ? 'browser_geolocation_realtime' : 'browser_geolocation_precise',
      }),
    };

    router.post(safeRoute('siswa.absensi.store'), payload, {
      preserveScroll: true,
      preserveState: true,
      onStart: () => {
        setIsSubmitting(true);

        setToast({
          show: true,
          message: 'Memvalidasi lokasi dan jaringan...',
          type: 'success',
        });
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
      onSuccess: () => {
        setToast({
          show: true,
          message: 'Absensi berhasil disimpan.',
          type: 'success',
        });
      },
      onError: (errors) => {
        const message =
          errors.latitude ||
          errors.longitude ||
          errors.message ||
          errors.network ||
          'Terjadi kesalahan validasi absensi.';

        setToast({
          show: true,
          message,
          type: 'error',
        });

        setLocationError(message);
      },
    });
  };

  return (
    <SiswaLayout
      header="Dashboard Siswa"
      subtitle="Absensi realtime berbasis GPS, radius sekolah, dan validasi jaringan."
      className="bg-slate-50 font-sans"
    >
      <Head title="Dashboard Siswa" />

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((current) => ({ ...current, show: false }))}
      />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/50 to-sky-50/70 pb-36 lg:pb-10">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-44 h-80 w-80 translate-x-24 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

        <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-6 lg:px-8 lg:py-6">
          <section className="relative overflow-hidden rounded-[2.25rem] p-5 text-white shadow-[0_28px_90px_-55px_rgba(15,23,42,0.9)] sm:p-6 lg:p-7">
            {/* Background Image & Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
              style={{ backgroundImage: 'url(/images/bgdashboard.jpeg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-blue-950/80 to-cyan-900/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-blue-900/40 to-cyan-800/40" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 translate-y-12 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
                <div className="shrink-0">
                  <img
                    src={profilePhotoUrl}
                    alt={siswa?.nama_lengkap || 'Siswa'}
                    className="h-20 w-20 rounded-2xl border-[3px] border-cyan-400/40 bg-slate-800 object-cover shadow-xl sm:h-24 sm:w-24 sm:rounded-[1.5rem]"
                    onError={(event) => {
                      event.currentTarget.src = avatarFallback(siswa?.nama_lengkap || 'Siswa');
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                    Smart Attendance SaaS
                  </div>

                  <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {siswa?.nama_lengkap || 'Siswa'}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-white/90 sm:justify-start">
                    <span className="rounded-xl border border-cyan-300/30 bg-cyan-400/15 px-2.5 py-1 text-cyan-100">
                      {kelasName}
                    </span>

                    <span className="hidden text-white/50 sm:inline">•</span>

                    <span className="text-white/80">NIS: {siswa?.nis || '-'}</span>

                    <span className="hidden text-white/50 sm:inline">•</span>

                    <span className="text-white/80">
                      Wali Kelas:{' '}
                      <strong className="text-white">
                        {siswa?.kelas?.wali_kelas?.nama_lengkap || 'Belum diatur'}
                      </strong>
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <StatusBadge status={todayStatus} />

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                      <TrendingUp className="h-3.5 w-3.5 text-cyan-300" />
                      Kehadiran {attendancePercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:min-w-[430px]">
                <HeroStat label="Hadir" value={summary.hadir} icon={CheckCircle2} tone="emerald" />
                <HeroStat label="Izin/Sakit" value={summary.sakit + summary.izin} icon={Info} tone="cyan" />
                <HeroStat label="Alfa" value={summary.alfa} icon={AlertTriangle} tone="rose" />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard label="Status Hari Ini" value={todayStatus} icon={Activity} tone={isCheckedOut ? 'emerald' : isCheckedIn ? 'amber' : 'slate'} />
            <MetricCard label="Jam Masuk" value={formatTime(absensiHariIni?.jam_masuk)} icon={Clock} tone="emerald" />
            <MetricCard label="Jam Pulang" value={formatTime(absensiHariIni?.jam_pulang)} icon={LogOut} tone="sky" />
            <MetricCard label="Radius Absensi" value={`${pengaturan?.radius_absen_meters || 200}m`} icon={ShieldCheck} tone="cyan" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <PremiumCard className="overflow-hidden p-0" delay={0}>
                <div
                  className={cn(
                    'h-1.5 w-full',
                    isCheckedOut
                      ? 'bg-emerald-500'
                      : isCheckedIn
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                  )}
                />

                <div className="p-5 sm:p-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                        <MapPin className="h-6 w-6" />
                      </div>

                      <div>
                        <h2 className="text-lg font-black text-slate-900">
                          Smart GPS Attendance
                        </h2>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          Peta realtime, jarak ke sekolah, akurasi GPS, dan metadata jaringan dikirim ke server.
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={todayStatus} />
                  </div>

                  <DigitalClock />

                  <div className="mx-auto mt-4 max-w-4xl space-y-5">
                    {pengaturan?.lokasi_sekolah_latitude && !isCheckedOut && (
                      <SmartGoogleMap
                        schoolLat={pengaturan.lokasi_sekolah_latitude}
                        schoolLng={pengaturan.lokasi_sekolah_longitude}
                        studentCoords={coords}
                        radius={pengaturan.radius_absen_meters}
                        small
                        centerMode={mapCenterMode}
                        distanceToSchool={distanceToSchool}
                        liveTracking={liveTracking}
                        networkSnapshot={networkSnapshot}
                        onRequestLocation={startRealtimeTracking}
                        onStopTracking={stopRealtimeTracking}
                        onOpenFullMap={() => setMapOpen(true)}
                      />
                    )}

                    {!isCheckedOut && (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                            <LocateFixed className="h-4 w-4 text-cyan-600" />
                            GPS Accuracy
                          </div>
                          <p className="mt-2 text-lg font-black text-slate-900">
                            {coords?.accuracy ? `${coords.accuracy}m` : '-'}
                          </p>
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                            <Navigation className="h-4 w-4 text-cyan-600" />
                            Jarak Sekolah
                          </div>
                          <p
                            className={cn(
                              'mt-2 text-lg font-black',
                              distanceToSchool !== null && distanceToSchool > (pengaturan?.radius_absen_meters || 200)
                                ? 'text-rose-600'
                                : 'text-emerald-600'
                            )}
                          >
                            {distanceToSchool !== null ? `${distanceToSchool}m` : '-'}
                          </p>
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                            <Wifi className="h-4 w-4 text-cyan-600" />
                            Jaringan & Ping
                          </div>
                          <p className="mt-2 text-lg font-black text-slate-900">
                            {networkSnapshot?.effectiveType || 'Unknown'} <span className="text-sm font-semibold text-slate-500 ml-1">• {networkSnapshot?.rtt || '-'}ms</span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mb-6 grid grid-cols-2 gap-3">
                      <div className="rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                        <span className="block text-[10px] font-black uppercase tracking-wide text-slate-400">Jam Masuk</span>
                        <span className={cn("mt-1.5 block font-mono text-2xl font-black", absensiHariIni?.jam_masuk ? "text-emerald-600" : "text-slate-300")}>{absensiHariIni?.jam_masuk ? formatTime(absensiHariIni.jam_masuk) : '—'}</span>
                      </div>
                      <div className="rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                        <span className="block text-[10px] font-black uppercase tracking-wide text-slate-400">Jam Pulang</span>
                        <span className={cn("mt-1.5 block font-mono text-2xl font-black", absensiHariIni?.jam_pulang ? "text-sky-600" : "text-slate-300")}>{absensiHariIni?.jam_pulang ? formatTime(absensiHariIni.jam_pulang) : '—'}</span>
                      </div>
                    </div>

                    {isCheckedOut ? (
                      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-emerald-100 bg-white text-emerald-600 shadow-sm">
                            <CheckCircle2 className="h-8 w-8" />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-lg font-black text-emerald-900">
                              Kehadiran Hari Ini Tuntas
                            </h3>

                            <p className="mt-1 text-sm font-semibold leading-relaxed text-emerald-700">
                              Terima kasih, data masuk dan pulang sudah tercatat.
                            </p>

                            <div className="mt-3 inline-flex rounded-2xl border border-emerald-100 bg-white/70 px-3 py-1.5 font-mono text-xs font-black text-emerald-800">
                              Masuk: {formatTime(absensiHariIni.jam_masuk)} • Pulang: {formatTime(absensiHariIni.jam_pulang)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : isTimeUp && !isCheckedIn ? (
                      <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center">
                        <Ban className="mx-auto h-12 w-12 text-rose-500" />

                        <h3 className="mt-3 text-lg font-black text-rose-800">
                          Batas Waktu Habis
                        </h3>

                        <p className="mx-auto mt-1 max-w-sm text-sm font-semibold leading-relaxed text-rose-600">
                          Anda tidak dapat melakukan absen masuk karena waktu telah berakhir. Silakan lapor ke guru piket.
                        </p>
                      </div>
                    ) : isTooEarly ? (
                      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-sky-100 bg-white text-sky-600 shadow-sm">
                          <Timer className="h-7 w-7" />
                        </div>

                        <h3 className="mt-3 text-lg font-black text-sky-800">
                          {isCheckedIn ? 'Belum Waktunya Pulang' : 'Absensi Belum Dibuka'}
                        </h3>

                        <p className="mx-auto mt-1 max-w-sm text-sm font-semibold leading-relaxed text-sky-600">
                          Silakan tunggu. {isCheckedIn ? 'Absensi pulang' : 'Absensi masuk'} akan dibuka pada pukul{' '}
                          <strong className="rounded-lg bg-sky-100 px-1.5 py-0.5 font-mono">
                            {earlyTimeStr}
                          </strong>.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleAbsen}>
                        <button
                          type="submit"
                          disabled={isSubmitting || locating}
                          className={cn(
                            'group relative w-full overflow-hidden rounded-3xl px-6 py-5 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] disabled:cursor-wait disabled:opacity-70',
                            isCheckedIn
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-500/20'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/20'
                          )}
                        >
                          <div className="relative z-10 flex items-center justify-center gap-3">
                            {isSubmitting || locating ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : isCheckedIn ? (
                              <LogOut className="h-6 w-6" />
                            ) : (
                              <Clock className="h-6 w-6" />
                            )}

                            <div className="text-left">
                              <span className="block text-lg font-black leading-none">
                                {locating
                                  ? 'Mencari Lokasi...'
                                  : isSubmitting
                                    ? 'Mengirim Data...'
                                    : isCheckedIn
                                      ? 'Absen Pulang'
                                      : 'Absen Masuk'}
                              </span>

                              {!isSubmitting && !locating && (
                                <span className="mt-1 block text-[10px] font-black uppercase tracking-wider opacity-80">
                                  Validasi GPS + jaringan di server
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                        </button>

                        {locating && (
                          <button
                            type="button"
                            onClick={cancelLocating}
                            className="mt-4 w-full text-center text-xs font-black uppercase tracking-wide text-slate-400 transition hover:text-rose-500"
                          >
                            Batalkan Pencarian Lokasi
                          </button>
                        )}
                      </form>
                    )}

                    {locationError && (
                      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center text-xs font-bold text-rose-600">
                        {locationError}
                      </div>
                    )}

                    {coords && !isCheckedOut && (
                      <div className="flex flex-col items-center justify-center gap-2 text-xs font-bold text-slate-400 sm:flex-row">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5">
                          <LocateFixed className="h-4 w-4 text-cyan-600" />
                          GPS: <strong>{coords.accuracy}m</strong>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setCoords(null);
                            setDistanceToSchool(null);
                            setMapCenterMode('school');
                            stopRealtimeTracking();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-3 py-1.5 transition hover:border-cyan-200 hover:text-cyan-700"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Reset GPS
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </PremiumCard>

              {/* === Kehadiran Mapel Minggu Ini === */}
              <PremiumCard className="overflow-hidden p-0" delay={70}>
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
                        Kehadiran Mapel Minggu Ini
                      </h2>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {absensiMapelMingguIni.length} catatan kehadiran mata pelajaran
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  {absensiMapelMingguIni.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {absensiMapelMingguIni.map((mapel) => (
                        <div key={mapel.id_absensi_mapel} className="flex items-center justify-between p-4 border border-slate-100 rounded-3xl bg-slate-50">
                          <div>
                            <div className="text-sm font-bold text-slate-900">{mapel.jadwal?.mata_pelajaran?.nama_mapel}</div>
                            <div className="text-xs text-slate-500 mt-1">{mapel.tanggal} • {mapel.jadwal?.jam_mulai?.substring(0,5)}</div>
                          </div>
                          <span className={cn(
                            "px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                            mapel.status_kehadiran === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :
                            mapel.status_kehadiran === 'Alfa' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          )}>
                            {mapel.status_kehadiran}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-sm font-bold text-slate-400 py-4">
                      Belum ada data kehadiran mapel minggu ini.
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <Link href={safeRoute('siswa.absensi-mapel.index')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                      Lihat Detil Kehadiran Mapel &rarr;
                    </Link>
                  </div>
                </div>
              </PremiumCard>
            </div>

            <aside className="space-y-6 xl:col-span-4">
              <AttendanceProgress summary={summary} />

              <PremiumCard className="flex h-full flex-col overflow-hidden p-0" delay={140}>
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                        <CalendarDays className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
                          Riwayat Absensi
                        </h2>

                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {filteredRiwayat.length} data tampil
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <select
                        value={historyFilter}
                        onChange={(event) => setHistoryFilter(event.target.value)}
                        className="min-h-10 appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-xs font-black text-slate-600 outline-none transition hover:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                      >
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                        <option value="year">Tahun Ini</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-5 xl:max-h-[460px]">
                  {filteredRiwayat.length > 0 ? (
                    filteredRiwayat.map((item) => {
                      const meta = statusMeta(item.status_kehadiran);

                      return (
                        <div
                          key={item.id_absensi}
                          className="group rounded-3xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-cyan-200 hover:shadow-lg"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-black text-slate-800">
                                {new Date(item.tanggal).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                })}
                              </div>

                              <div className="mt-0.5 text-[10px] font-bold text-slate-400">
                                {new Date(item.tanggal).getFullYear()}
                              </div>
                            </div>

                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
                                meta.className
                              )}
                            >
                              <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
                              {meta.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              <span className="font-mono font-bold">
                                {formatTime(item.jam_masuk)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2">
                              <span className={cn('h-2 w-2 rounded-full', item.jam_pulang ? 'bg-amber-400' : 'bg-slate-300')} />
                              <span className="font-mono font-bold">
                                {formatTime(item.jam_pulang)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex h-56 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/70 text-center text-slate-400">
                      <BarChart3 className="mb-3 h-11 w-11 opacity-35" />
                      <p className="text-sm font-black">Belum ada riwayat</p>
                      <p className="mt-1 text-xs font-medium opacity-80">
                        Data absensi akan muncul di sini.
                      </p>
                    </div>
                  )}
                </div>
              </PremiumCard>
            </aside>
          </div>
        </main>

        <div className="fixed bottom-20 left-0 right-0 z-50 px-4 md:hidden">
          {!isCheckedOut && (!isTimeUp || isCheckedIn) && (
            <button
              type="button"
              onClick={handleAbsen}
              disabled={isSubmitting || locating || isTooEarly}
              className={cn(
                'flex w-full items-center justify-center gap-3 rounded-3xl py-4 font-black text-white shadow-2xl transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70',
                isTooEarly
                  ? 'bg-slate-400 shadow-none'
                  : isCheckedIn
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-500/20'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/20'
              )}
            >
              {isSubmitting || locating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isCheckedIn ? (
                <LogOut className="h-6 w-6" />
              ) : (
                <Clock className="h-6 w-6" />
              )}

              <span>
                {locating
                  ? 'Mencari Lokasi...'
                  : isSubmitting
                    ? 'Mengirim Data...'
                    : isTooEarly
                      ? `Tunggu ${earlyTimeStr}`
                      : isCheckedIn
                        ? 'Absen Pulang Sekarang'
                        : 'Absen Masuk Sekarang'}
              </span>
            </button>
          )}

          {isCheckedOut && (
            <div className="rounded-3xl border border-emerald-200 bg-white/95 py-3 text-center text-sm font-black text-emerald-700 shadow-2xl backdrop-blur-xl">
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Kehadiran Hari Ini Tuntas
              </span>
            </div>
          )}
        </div>

        {mapOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-4">
            <div className="animate-modal-pop flex h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-white p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <MapPin className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      Smart Google Map Absensi
                    </h3>

                    <p className="hidden text-xs font-medium text-slate-500 sm:block">
                      Pantau lokasi realtime, radius sekolah, jarak, dan akurasi GPS.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMapOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="relative flex-1 bg-slate-100">
                <SmartGoogleMap
                  schoolLat={pengaturan?.lokasi_sekolah_latitude}
                  schoolLng={pengaturan?.lokasi_sekolah_longitude}
                  studentCoords={coords}
                  radius={pengaturan?.radius_absen_meters}
                  small={false}
                  centerMode={mapCenterMode}
                  distanceToSchool={distanceToSchool}
                  liveTracking={liveTracking}
                  networkSnapshot={networkSnapshot}
                  onRequestLocation={startRealtimeTracking}
                  onStopTracking={stopRealtimeTracking}
                />

                <div className="absolute bottom-6 left-1/2 z-[400] flex -translate-x-1/2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMapCenterMode('school')}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black shadow-lg transition active:scale-95',
                      mapCenterMode === 'school'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <School className="h-4 w-4" />
                    Sekolah
                  </button>

                  <button
                    type="button"
                    onClick={() => setMapCenterMode('student')}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black shadow-lg transition active:scale-95',
                      mapCenterMode === 'student'
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <MapPin className="h-4 w-4" />
                    Posisi Saya
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes softRise {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-14px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .animate-soft-rise {
          animation: softRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-modal-pop {
          animation: modalPop 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-toast-in {
          animation: toastIn 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-shimmer {
          animation: shimmer 1.4s infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.35);
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.45);
        }
      `}</style>
    </SiswaLayout>
  );
}