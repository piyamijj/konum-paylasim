"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";

// Leaflet is NOT imported as a bundled module here. It is loaded once as a
// plain global <script> tag from the root layout (window.L), which avoids
// the next/dynamic + webpack code-split path entirely — that split was
// producing a broken chunk reference (404) in production builds.
declare global {
  interface Window {
    L?: typeof Leaflet;
  }
}

interface LiveMapProps {
  sharerLocation: { lat: number; lng: number; accuracy?: number } | null;
  viewerLocation?: { lat: number; lng: number } | null;
  isSharer?: boolean;
}

export default function LiveMap({
  sharerLocation,
  viewerLocation,
  isSharer = false,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const sharerMarkerRef = useRef<Leaflet.Marker | null>(null);
  const sharerAccuracyCircleRef = useRef<Leaflet.Circle | null>(null);
  const viewerMarkerRef = useRef<Leaflet.Marker | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  // Wait until the global Leaflet script has finished loading (window.L
  // exists). It is requested with a normal <script> tag in the root layout,
  // so on most loads it is already present; this poll is just a safety net
  // for slow networks or race conditions on first paint.
  useEffect(() => {
    if (typeof window !== "undefined" && window.L) {
      setLeafletReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.L) {
        setLeafletReady(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!leafletReady) return;
    const L = window.L;
    if (!L || !mapContainerRef.current || mapRef.current) return;

    // Default center (Istanbul) if no location is provided yet
    const initialLat = sharerLocation?.lat || 41.0082;
    const initialLng = sharerLocation?.lng || 28.9784;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([initialLat, initialLng], 16);

    // Add dark mode styled OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      className: "dark-tiles",
    }).addTo(map);

    mapRef.current = map;

    // Safety net: if the container had zero size at the moment Leaflet
    // measured it (common right after a flex/conditional mount), the tiles
    // never paint even though the div is visually present. Force Leaflet to
    // re-measure a few times shortly after mount and again on any resize.
    const invalidate = () => mapRef.current?.invalidateSize();
    const timers = [50, 200, 500, 1000].map((delay) => setTimeout(invalidate, delay));
    window.addEventListener("resize", invalidate);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(invalidate);
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", invalidate);
      resizeObserver?.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady]);

  // Update Sharer Location Marker
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || !sharerLocation) return;

    const { lat, lng, accuracy } = sharerLocation;
    const position: Leaflet.LatLngExpression = [lat, lng];

    // Custom icon for sharer (neon green pulse)
    const sharerIcon = L.divIcon({
      className: "custom-marker-sharer",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      html: '<div class="pulse-ring"></div>',
    });

    if (sharerMarkerRef.current) {
      sharerMarkerRef.current.setLatLng(position);
    } else {
      sharerMarkerRef.current = L.marker(position, { icon: sharerIcon })
        .addTo(map)
        .bindPopup(isSharer ? "Sizin Konumunuz (Paylaşılıyor)" : "Canlı Konum (Paylaşan)")
        .openPopup();
    }

    // Accuracy circle
    if (accuracy) {
      if (sharerAccuracyCircleRef.current) {
        sharerAccuracyCircleRef.current.setLatLng(position);
        sharerAccuracyCircleRef.current.setRadius(accuracy);
      } else {
        sharerAccuracyCircleRef.current = L.circle(position, {
          radius: accuracy,
          color: "#39ff8f",
          fillColor: "#39ff8f",
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(map);
      }
    }

    // Pan map to sharer location if it's the first update or if we want to keep tracking
    map.panTo(position);
  }, [sharerLocation, isSharer, leafletReady]);

  // Update Viewer Location Marker (if available)
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || !viewerLocation) {
      if (viewerMarkerRef.current) {
        viewerMarkerRef.current.remove();
        viewerMarkerRef.current = null;
      }
      return;
    }

    const { lat, lng } = viewerLocation;
    const position: Leaflet.LatLngExpression = [lat, lng];

    // Custom icon for viewer (neon orange)
    const viewerIcon = L.divIcon({
      className: "custom-marker-viewer",
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    if (viewerMarkerRef.current) {
      viewerMarkerRef.current.setLatLng(position);
    } else {
      viewerMarkerRef.current = L.marker(position, { icon: viewerIcon })
        .addTo(map)
        .bindPopup(isSharer ? "İzleyici Konumu" : "Sizin Konumunuz")
        .openPopup();
    }
  }, [viewerLocation, isSharer, leafletReady]);

  // Fit bounds if both locations exist
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || !sharerLocation || !viewerLocation) return;

    const bounds = L.latLngBounds([
      [sharerLocation.lat, sharerLocation.lng],
      [viewerLocation.lat, viewerLocation.lng],
    ]);

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [sharerLocation, viewerLocation, leafletReady]);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl border border-night-700 bg-night-950 shadow-inner">
      {/* mapContainerRef is sized via `absolute inset-0` rather than
          `h-full w-full`. Percentage heights (h-full = height:100%) can
          fail to resolve against a flex-item ancestor whose own height
          comes from flex-grow rather than an explicit CSS length — this is
          exactly what was silently collapsing this whole component (and
          everything inside it, including this file's own always-rendered
          content) to zero height in production. Absolute positioning sizes
          directly from the nearest positioned ancestor's real box instead,
          sidestepping that resolution entirely. */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {!leafletReady && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-night-950">
          <span className="text-sm text-night-300">Harita yükleniyor...</span>
        </div>
      )}

      {/* Map Overlay Controls */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => {
            if (mapRef.current && sharerLocation) {
              mapRef.current.setView([sharerLocation.lat, sharerLocation.lng], 17);
            }
          }}
          className="flex h-10 items-center justify-center rounded-lg border border-night-600 bg-night-800 px-3 text-xs font-medium text-neon-green shadow-lg transition-all hover:bg-night-700 active:scale-95"
        >
          🎯 Paylaşanı Bul
        </button>
      </div>
    </div>
  );
}