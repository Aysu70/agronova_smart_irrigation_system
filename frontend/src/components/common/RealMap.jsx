import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ensure default icons available (CDN fallback)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapViewSync({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
}

export default function RealMap({
  items = [],
  getPosition = (it) => [it.location?.lat, it.location?.lng],
  center = [0, 0],
  zoom = 6,
  onMarkerClick,
  popupRenderer,
  itemKey = (it, idx) => it.id || it._id || it.deviceId || idx,
  statusKey = null,
  statusColorMap = {},
}) {
  const createIcon = (item) => {
    if (!statusKey) return undefined;
    const status = item[statusKey];
    const color = (statusColorMap && statusColorMap[status]?.bg) || "#6b7280";
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background:${color}; width:24px; height:24px; border-radius:50%; border:3px solid white;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewSync center={center} zoom={zoom} />

      {items.map((it, idx) => {
        const pos = getPosition(it) || [0, 0];
        return (
          <Marker
            key={itemKey(it, idx)}
            position={pos}
            icon={createIcon(it)}
            eventHandlers={{ click: () => onMarkerClick && onMarkerClick(it) }}
          >
            <Popup>{popupRenderer ? popupRenderer(it) : null}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
