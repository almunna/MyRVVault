import React, { useMemo, useRef } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useGetCampQuery } from "../redux/api/routesApi";

const mapContainerStyle = { width: "100%", height: "560px" };
const MAP_CENTER = { lat: 39.8283, lng: -98.5795 };
const MAP_ZOOM = 4;
const mapOptions = {
  center: MAP_CENTER,
  zoom: MAP_ZOOM,
  scrollwheel: false,
  gestureHandling: "cooperative",
  mapTypeControl: true,
  mapTypeControlOptions: {
    position: 3,
  },
  fullscreenControl: false,
  restriction: {
    latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
    strictBounds: true,
  },
};

export const STATE_COORDINATES = {
  ALABAMA: { lat: 32.8067, lng: -86.7911 },
  ALASKA: { lat: 61.3704, lng: -152.4044 },
  ARIZONA: { lat: 34.0489, lng: -111.0937 },
  ARKANSAS: { lat: 34.7465, lng: -92.2896 },
  CALIFORNIA: { lat: 36.7783, lng: -119.4179 },
  COLORADO: { lat: 39.5501, lng: -105.7821 },
  CONNECTICUT: { lat: 41.6032, lng: -73.0877 },
  DELAWARE: { lat: 39.3185, lng: -75.5071 },
  FLORIDA: { lat: 27.7663, lng: -82.6404 },
  GEORGIA: { lat: 33.249, lng: -83.4426 },
  HAWAII: { lat: 21.1098, lng: -157.5311 },
  IDAHO: { lat: 44.2619, lng: -114.013 },
  ILLINOIS: { lat: 40.3363, lng: -89.0022 },
  INDIANA: { lat: 39.8647, lng: -86.2604 },
  IOWA: { lat: 42.0046, lng: -93.214 },
  KANSAS: { lat: 38.5767, lng: -96.6794 },
  KENTUCKY: { lat: 37.6681, lng: -84.6701 },
  LOUISIANA: { lat: 31.1801, lng: -91.8749 },
  MAINE: { lat: 44.6939, lng: -69.3819 },
  MARYLAND: { lat: 39.0639, lng: -76.8021 },
  MASSACHUSETTS: { lat: 42.2373, lng: -71.5314 },
  MICHIGAN: { lat: 43.3266, lng: -84.5361 },
  MINNESOTA: { lat: 45.7326, lng: -93.9196 },
  MISSISSIPPI: { lat: 32.7673, lng: -89.6812 },
  MISSOURI: { lat: 38.4623, lng: -92.302 },
  MONTANA: { lat: 47.0527, lng: -110.2148 },
  NEBRASKA: { lat: 41.1289, lng: -98.2883 },
  NEVADA: { lat: 38.4199, lng: -117.1219 },
  NEW_HAMPSHIRE: { lat: 43.4108, lng: -71.5653 },
  NEW_JERSEY: { lat: 40.314, lng: -74.5089 },
  NEW_MEXICO: { lat: 34.8375, lng: -106.2371 },
  NEW_YORK: { lat: 42.1657, lng: -74.9481 },
  NORTH_CAROLINA: { lat: 35.6411, lng: -79.8431 },
  NORTH_DAKOTA: { lat: 47.5362, lng: -99.793 },
  OHIO: { lat: 40.3736, lng: -82.7755 },
  OKLAHOMA: { lat: 35.5376, lng: -96.9247 },
  OREGON: { lat: 44.5672, lng: -122.1269 },
  PENNSYLVANIA: { lat: 40.5773, lng: -77.264 },
  RHODE_ISLAND: { lat: 41.6762, lng: -71.5562 },
  SOUTH_CAROLINA: { lat: 33.8191, lng: -80.9066 },
  SOUTH_DAKOTA: { lat: 44.2853, lng: -99.4632 },
  TENNESSEE: { lat: 35.7449, lng: -86.7489 },
  TEXAS: { lat: 31.0545, lng: -97.5635 },
  UTAH: { lat: 40.1135, lng: -111.8535 },
  VERMONT: { lat: 44.0407, lng: -72.7093 },
  VIRGINIA: { lat: 37.768, lng: -78.2057 },
  WASHINGTON: { lat: 47.0417, lng: -122.8959 },
  WEST_VIRGINIA: { lat: 38.468, lng: -80.9696 },
  WISCONSIN: { lat: 44.2619, lng: -89.6167 },
  WYOMING: { lat: 42.7475, lng: -107.2085 },
};

const STATUS_STYLE = {
  CAMPED:           { color: "green",  label: "Camped" },
  TRAVELED_THROUGH: { color: "blue",   label: "Traveled Through" },
  PLANNING:         { color: "purple", label: "Planning" },
  NOT_VISITED:      { color: "red",    label: "Not Visited" },
};

const Progress = () => {
  const { data: campData } = useGetCampQuery();
  const mapRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
  });

  const markers = useMemo(() => {
    if (!campData?.data) return [];
    return campData.data.flatMap((trip) =>
      trip.states.map((s) => {
        const key = (s.state || "").toUpperCase().replace(/ /g, "_");
        const coord = STATE_COORDINATES[key];
        if (!coord) return null;
        return { lat: coord.lat, lng: coord.lng, status: s.status, state: s.state };
      })
    ).filter(Boolean);
  }, [campData]);

  if (!isLoaded) {
    return (
      <div
        className="bg-white border border-[#E8F0E8] rounded-2xl shadow-sm flex items-center justify-center"
        style={{ height: 560 }}
      >
        <p className="text-[#5A5A5A] text-sm">Loading map…</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Your Progress</h2>

      <div
        className="bg-white border border-[#E8F0E8] rounded-2xl overflow-hidden shadow-sm"
        style={{ isolation: "isolate" }}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          options={mapOptions}
          onLoad={(map) => {
            mapRef.current = map;
            map.setCenter(MAP_CENTER);
            map.setZoom(MAP_ZOOM);
          }}
        >
          {markers.map((m, i) => {
            const style = STATUS_STYLE[m.status] || { color: "gray", label: m.status };
            return (
              <Marker
                key={i}
                position={{ lat: m.lat, lng: m.lng }}
                title={`${m.state} — ${style.label}`}
                icon={{
                  url: `http://maps.google.com/mapfiles/ms/icons/${style.color}-dot.png`,
                }}
              />
            );
          })}
        </GoogleMap>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white border border-[#E8F0E8] rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Map Legend</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(STATUS_STYLE).map(([key, { color, label }]) => (
            <div key={key} className="flex items-center gap-1.5 text-sm text-[#5A5A5A]">
              <img
                src={`http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`}
                alt={label}
                className="w-4 h-4 object-contain"
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;
