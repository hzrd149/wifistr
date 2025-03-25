import { getOrComputeCachedValue } from "applesauce-core/helpers";
import { LatLngLiteral } from "leaflet";
import { NostrEvent } from "nostr-tools";
import ngeohash from "ngeohash";

const latLongSymbol = Symbol("latLong");

export function getLatLongFromEvent(event: NostrEvent): LatLngLiteral | null {
  return getOrComputeCachedValue(event, latLongSymbol, () => {
    const geohash = event.tags.reduce(
      (curr, tag) =>
        tag[0] === "g" && tag[1] && tag[1].length > curr.length ? tag[1] : curr,
      "",
    );
    if (!geohash) return null;

    const decoded = ngeohash.decode(geohash);

    return {
      lat: decoded.latitude,
      lng: decoded.longitude,
    };
  });
}

// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getMapUrl(event: NostrEvent): string | null {
  const location = getLatLongFromEvent(event);
  if (!location) return null;

  // Generic map coordinates format that works with multiple map providers
  return `geo:${location.lat},${location.lng}`;
}
