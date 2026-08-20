import React, { useEffect, useRef } from 'react';
import { Marker } from 'react-leaflet';
import 'leaflet.marker.slideto';

export default function SmoothMarker({ position, duration = 2000, ...props }) {
    const markerRef = useRef(null);
    const initialPos = useRef(position);

    useEffect(() => {
        const marker = markerRef.current;
        if (marker && marker.slideTo) {
            marker.slideTo(position, {
                duration: duration,
                keepAtCenter: false
            });
        }
    }, [position, duration]);

    // Kita meneruskan posisi awal ke react-leaflet Marker agar tidak terjadi
    // lompatan instan saat prop position berubah. leaflet.marker.slideto 
    // akan menangani transisi halusnya.
    return <Marker ref={markerRef} position={initialPos.current} {...props} />;
}
