"use client";

import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

interface LocationMapProps {
  /** Pin position. If null, no pin is rendered (default-region view). */
  lat: number | null;
  lng: number | null;
  /** Center for the map view. Falls back to lat/lng when present. */
  centerLat: number;
  centerLng: number;
  /** Zoom for the map view. Use a tighter zoom when a real pin is set. */
  zoom: number;
  /** Optional label shown in the marker tooltip */
  label?: string;
  /** Fired when the user clicks the map */
  onPick?: (lat: number, lng: number) => void;
}

// Inline SVG pin in the brand green — avoids the default-icon-path nightmare
// (Leaflet's bundled marker images resolve relative to the webpack URL and
// break under Next/Turbopack without manual asset shimming).
const PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
  <defs>
    <filter id="s" x="-30%" y="-10%" width="160%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity="0.25" />
    </filter>
  </defs>
  <path filter="url(#s)" d="M16 1c-7.7 0-14 6.3-14 14 0 9.3 12.4 26.5 13 27.3.3.4.7.7 1 .7s.7-.3 1-.7c.6-.8 13-18 13-27.3 0-7.7-6.3-14-14-14z"
    fill="#16a34a" stroke="white" stroke-width="2" />
  <circle cx="16" cy="15" r="5.5" fill="white" />
</svg>
`;

const pinIcon = L.divIcon({
  className: "location-pin",
  html: PIN_SVG,
  iconSize: [32, 44],
  iconAnchor: [16, 42],
});

function ViewSync({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

function ClickHandler({ onPick }: { onPick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPick?.(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function SizeFix() {
  const map = useMap();
  useEffect(() => {
    // Leaflet computes tile bounds from container dims at mount; if the
    // container's size resolves late (dynamic import, sticky parent, etc.)
    // tiles never paint. invalidateSize forces a recompute.
    const t1 = setTimeout(() => map.invalidateSize(), 0);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

export function LocationMap({
  lat,
  lng,
  centerLat,
  centerLng,
  zoom,
  label,
  onPick,
}: LocationMapProps) {
  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={zoom}
      scrollWheelZoom={false}
      className={`h-64 w-full rounded-lg border ${onPick ? "cursor-crosshair" : ""}`}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
      />
      {lat !== null && lng !== null && (
        <Marker position={[lat, lng]} icon={pinIcon} title={label} />
      )}
      <ViewSync lat={centerLat} lng={centerLng} zoom={zoom} />
      <SizeFix />
      {onPick && <ClickHandler onPick={onPick} />}
    </MapContainer>
  );
}
