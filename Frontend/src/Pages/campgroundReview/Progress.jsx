import React, { useMemo } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useGetCampQuery } from "../redux/api/routesApi";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 39.8283, // USA center
  lng: -98.5795,
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

const STATUS_COLOR = {
  CAMPED: "green",
  TRAVELED_THROUGH: "orange",
  PLANNING: "blue",
  NOT_VISITED: "red",
};

const Progress = () => {
  const { data: campData } = useGetCampQuery();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY, 
  });

  const markers = useMemo(() => {
    if (!campData?.data) return [];

    return campData.data.flatMap((trip) =>
      trip.states.map((s) => {
        const coord = STATE_COORDINATES[s.state];
        if (!coord) return null;

        return {
          ...coord,
          status: s.status,
          state: s.state,
        };
      })
    ).filter(Boolean);
  }, [campData]);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <div className="mt-4">
      <h1 className="text-lg font-semibold text-[#F9B038] mb-4">
        Your Progress
      </h1>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={4}
        center={center}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: `http://maps.google.com/mapfiles/ms/icons/${STATUS_COLOR[marker.status]}-dot.png`,
            }}
            title={`${marker.state} - ${marker.status}`}
          />
        ))}
      </GoogleMap>

      {/* Legend */}
      <div className="mt-4 text-sm text-[#F9B038]">
        <p className="font-semibold mb-2">Map Legend</p>
        <ul className="space-y-1">
          <li>🟢 Camped</li>
          <li>🟠 Traveled Through</li>
          <li>🔵 Planning</li>
          <li>🔴 Not Visited</li>
        </ul>
      </div>
    </div>
  );
};

export default Progress;
