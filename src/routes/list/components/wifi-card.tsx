import {
  getAddressPointerForEvent,
  getTagValue,
} from "applesauce-core/helpers";
import { createMemo, from } from "solid-js";
import { A } from "@solidjs/router";
import { naddrEncode } from "nostr-tools/nip19";
import { NostrEvent } from "nostr-tools";

import { location$ } from "../../../services/location";
import {
  calculateDistance,
  getLatLongFromEvent,
  getMapUrl,
} from "../../../helpers/geohash";
import { MapIcon } from "../../../components/icons";

export default function NetworkCard(props: { network: NostrEvent }) {
  const location = from(location$);

  const ssid = getTagValue(props.network, "ssid");
  const name = getTagValue(props.network, "name");
  const security = getTagValue(props.network, "security") || "unknown";
  const captive = getTagValue(props.network, "c") || "unknown";

  // Calculate distance
  const distance = createMemo(() => {
    const user = location();
    const networkLocation = getLatLongFromEvent(props.network);
    if (!networkLocation || !user) return null;

    return calculateDistance(
      user.coords.latitude,
      user.coords.longitude,
      networkLocation.lat,
      networkLocation.lng,
    );
  });

  // Format distance in miles (converting from kilometers)
  const formattedDistance = createMemo(() => {
    const dist = distance();
    if (dist === null) return "Unknown distance";
    // Convert km to miles (1 km = 0.621371 miles)
    const miles = dist * 0.621371;
    return `${miles.toFixed(2)} miles away`;
  });

  // Get map URL
  const mapUrl = createMemo(() => getMapUrl(props.network));

  return (
    <div class="bg-white rounded-lg shadow p-4 relative">
      <A
        href={`/wifi/${naddrEncode(getAddressPointerForEvent(props.network))}`}
        class="text-blue-500 hover:underline float-right"
      >
        View
      </A>
      <h3 class="text-lg font-semibold">{name || ssid}</h3>
      <p class="text-sm text-gray-500">Security: {security}</p>
      <p class="text-sm text-gray-500">Captive: {captive}</p>
      <p class="text-sm text-gray-500">{formattedDistance()}</p>
      {mapUrl() && (
        <a
          href={mapUrl()!}
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-500 hover:underline text-sm inline-flex items-center mt-2 absolute bottom-4 right-4"
          aria-label="Open in Maps"
        >
          <MapIcon />
        </a>
      )}
    </div>
  );
}
