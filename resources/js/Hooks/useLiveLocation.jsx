import { useState, useEffect } from 'react';
import axios from 'axios';

// Module-level variables to persist state across Inertia SPA page navigations
let globalWatchId = null;
let globalLastUpdate = 0;
let globalPermission = 'prompt';
let globalError = null;
let globalIsTracking = false;
let globalLastPosition = null;
let subscribers = [];

const minUpdateInterval = 10000; // 10 seconds throttle

function notifySubscribers() {
    subscribers.forEach(fn => fn({
        isTracking: globalIsTracking,
        permission: globalPermission,
        error: globalError,
        lastPosition: globalLastPosition,
    }));
}

export function useLiveLocation(isSiswa = true) {
    const [locationState, setLocationState] = useState({
        isTracking: globalIsTracking,
        permission: globalPermission,
        error: globalError,
        lastPosition: globalLastPosition,
    });

    useEffect(() => {
        if (!isSiswa) return;

        // Register subscriber
        const updateState = (newState) => setLocationState(newState);
        subscribers.push(updateState);

        // Check initial permission status if not already checked
        if (navigator.permissions && globalPermission === 'prompt') {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                globalPermission = result.state;
                notifySubscribers();
                result.onchange = () => {
                    globalPermission = result.state;
                    notifySubscribers();
                };
            }).catch(() => {
                // Ignore fallback
            });
        }

        const startTracking = () => {
            if (globalWatchId !== null) return; // Already tracking!

            if (!navigator.geolocation) {
                globalError = 'Geolocation is not supported by your browser.';
                notifySubscribers();
                return;
            }

            globalWatchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;

                    // Anti-Fake GPS Heuristic
                    const isMocked = position.mocked || position.coords.mocked;
                    const isSuspiciousFake = 
                        (altitude === 0 || altitude === null) &&
                        (altitudeAccuracy === 0 || altitudeAccuracy === null) &&
                        (heading === 0 || heading === null || Number.isNaN(heading)) &&
                        (speed === 0 || speed === null);
                    const isPerfectRound = accuracy % 1 === 0 && accuracy <= 20;

                    if (isMocked || (isSuspiciousFake && isPerfectRound)) {
                        globalError = 'Terdeteksi penggunaan Fake GPS / Lokasi Palsu.';
                        globalIsTracking = false;
                        notifySubscribers();
                        if (globalWatchId !== null) navigator.geolocation.clearWatch(globalWatchId);
                        return;
                    }

                    globalIsTracking = true;
                    globalPermission = 'granted';
                    globalError = null;
                    globalLastPosition = { latitude, longitude, accuracy };
                    notifySubscribers();

                    const now = Date.now();
                    // Throttle updates to avoid spamming the server
                    if (now - globalLastUpdate >= minUpdateInterval) {
                        globalLastUpdate = now;
                        
                        // Send data to backend
                        axios.post('/siswa/lokasi/realtime', {
                            latitude,
                            longitude,
                            accuracy,
                            network_meta: JSON.stringify({
                                effectiveType: navigator.connection ? navigator.connection.effectiveType : '?',
                                downlink: navigator.connection ? navigator.connection.downlink : '?',
                                rtt: navigator.connection ? navigator.connection.rtt : '?',
                                type: navigator.connection && navigator.connection.type ? navigator.connection.type : '?',
                                device: /android/i.test(navigator.userAgent) ? 'Android' : (/ipad|iphone|ipod/i.test(navigator.userAgent) ? 'iOS' : (/mobile/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'))
                            }),
                            location_meta: JSON.stringify({
                                timestamp: position.timestamp,
                                altitude: position.coords.altitude,
                                altitudeAccuracy: position.coords.altitudeAccuracy,
                                heading: position.coords.heading,
                                speed: position.coords.speed,
                            })
                        }).catch(err => {
                            if (err.response && (err.response.status === 401 || err.response.status === 419 || err.response.status === 403)) {
                                window.location.href = '/';
                                return;
                            }
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

                    globalIsTracking = false;
                    globalPermission = permStatus;
                    globalError = errorMessage;
                    notifySubscribers();
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
            // Unsubscribe component, but DO NOT clear globalWatchId.
            // This ensures GPS tracking continues uninterrupted across page changes!
            subscribers = subscribers.filter(fn => fn !== updateState);
        };
    }, [isSiswa]);

    // Expose a method to manually request location
    const requestLocationRetry = () => {
        globalError = null;
        globalPermission = 'prompt';
        notifySubscribers();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    globalPermission = 'granted';
                    globalError = null;
                    notifySubscribers();
                },
                (err) => {
                    if (err.code === err.PERMISSION_DENIED) {
                        globalPermission = 'denied';
                        globalError = 'Izin akses lokasi ditolak.';
                        notifySubscribers();
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
