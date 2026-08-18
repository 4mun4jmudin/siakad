import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export function useLiveLocation(isSiswa = true) {
    const [locationState, setLocationState] = useState({
        isTracking: false,
        permission: 'prompt', // 'prompt', 'granted', 'denied'
        error: null,
        lastPosition: null,
    });

    const watchIdRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const minUpdateInterval = 10000; // 10 seconds throttle

    useEffect(() => {
        if (!isSiswa) return;

        // Check initial permission status
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setLocationState((prev) => ({ ...prev, permission: result.state }));
                result.onchange = () => {
                    setLocationState((prev) => ({ ...prev, permission: result.state }));
                };
            }).catch(() => {
                // Ignore fallback
            });
        }

        const startTracking = () => {
            if (!navigator.geolocation) {
                setLocationState((prev) => ({ ...prev, error: 'Geolocation is not supported by your browser.' }));
                return;
            }

            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;

                    setLocationState((prev) => ({
                        ...prev,
                        isTracking: true,
                        permission: 'granted',
                        error: null,
                        lastPosition: { latitude, longitude, accuracy },
                    }));

                    const now = Date.now();
                    // Throttle updates to avoid spamming the server
                    if (now - lastUpdateRef.current >= minUpdateInterval) {
                        lastUpdateRef.current = now;
                        
                        // Send data to backend
                        axios.post('/siswa/lokasi/realtime', {
                            latitude,
                            longitude,
                            accuracy,
                            network_meta: navigator.connection ? JSON.stringify({
                                effectiveType: navigator.connection.effectiveType,
                                downlink: navigator.connection.downlink,
                                rtt: navigator.connection.rtt,
                            }) : null,
                            location_meta: JSON.stringify({
                                timestamp: position.timestamp,
                                altitude: position.coords.altitude,
                                altitudeAccuracy: position.coords.altitudeAccuracy,
                                heading: position.coords.heading,
                                speed: position.coords.speed,
                            })
                        }).catch(err => {
                            console.error('Failed to update live location:', err);
                        });
                    }
                },
                (error) => {
                    let errorMessage = 'Gagal mendapatkan lokasi.';
                    let permStatus = 'prompt';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Izin akses lokasi ditolak. Aplikasi membutuhkan lokasi untuk beroperasi penuh.';
                            permStatus = 'denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Informasi lokasi tidak tersedia pada perangkat Anda saat ini.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Permintaan lokasi habis waktu (timeout).';
                            break;
                        default:
                            errorMessage = 'Terjadi kesalahan tidak dikenal saat mengakses lokasi.';
                            break;
                    }

                    setLocationState((prev) => ({
                        ...prev,
                        isTracking: false,
                        permission: permStatus,
                        error: errorMessage,
                    }));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0, // Force getting the real-time position
                }
            );
        };

        startTracking();

        return () => {
            if (watchIdRef.current !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [isSiswa]);

    // Expose a method to manually request location if they previously denied but then changed browser settings
    const requestLocationRetry = () => {
        setLocationState(prev => ({ ...prev, error: null, permission: 'prompt' }));
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setLocationState(prev => ({ ...prev, permission: 'granted', error: null }));
                    // The watchPosition in useEffect will automatically pick it up once permitted
                },
                (err) => {
                    if (err.code === err.PERMISSION_DENIED) {
                        setLocationState(prev => ({ ...prev, permission: 'denied', error: 'Izin akses lokasi ditolak.' }));
                    }
                },
                { enableHighAccuracy: true }
            );
        }
    };

    return {
        ...locationState,
        requestLocationRetry
    };
}
