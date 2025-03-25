import { createEffect, createMemo, For, from } from "solid-js";
import { TimelineQuery } from "applesauce-core/queries";
import { createRxOneshotReq } from "rx-nostr";
import { useNavigate } from "@solidjs/router";
import ngeohash from "ngeohash";

import { location$ } from "../../services/location";
import { eventStore, queryStore } from "../../services/stores";
import { WIFI_NETWORK_KIND } from "../../const";
import { calculateDistance, getLatLongFromEvent } from "../../helpers/geohash";
import { BackIcon } from "../../components/icons";
import NetworkCard from "./components/wifi-card";
import { appRelays } from "../../services/lifestyle";
import { rxNostr } from "../../services/nostr";

const LOAD_AT_PERCISION = 6;

export default function WifiListView() {
  const navigate = useNavigate();
  const location = from(location$);

  const relays = from(appRelays);

  const geohashes = createMemo(() => {
    const user = location();
    if (!user) return;

    const center = ngeohash.encode(
      user.coords.latitude,
      user.coords.longitude,
      LOAD_AT_PERCISION,
    );
    const neighbors = ngeohash.neighbors(center);
    return [center, ...neighbors];
  });

  // fetch the networks around the user
  let previousGeohashes: string[] | null = null;
  createEffect(() => {
    const fromRelays = relays();
    const currentGeohashes = geohashes();
    if (!currentGeohashes) return;

    // only update if the geohashes have actually changed
    if (
      previousGeohashes &&
      currentGeohashes.every((g) => previousGeohashes!.includes(g))
    )
      return;
    previousGeohashes = currentGeohashes;

    const req = createRxOneshotReq({
      filters: {
        kinds: [WIFI_NETWORK_KIND],
        "#g": currentGeohashes,
      },
    });

    console.log(`Requesting wifi networks around the user`, currentGeohashes);

    return rxNostr
      .use(req, { on: { relays: fromRelays } })
      .subscribe((packet) => eventStore.add(packet.event, packet.from));
  });

  const networks = from(
    queryStore.createQuery(TimelineQuery, {
      kinds: [WIFI_NETWORK_KIND],
    }),
  );

  // Add a loading state based on location availability
  const isLoading = createMemo(() => {
    return !location();
  });

  // Query and sort networks based on location
  const sortedNetworks = createMemo(() => {
    const events = networks();
    const position = location();

    if (!position || !events) return;

    // Sort networks by distance from user
    return Array.from(networks()!).sort((a, b) => {
      const aLocation = getLatLongFromEvent(a);
      const bLocation = getLatLongFromEvent(b);

      if (!aLocation || !bLocation) return 0;

      const distA = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        aLocation.lat,
        aLocation.lng,
      );

      const distB = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        bLocation.lat,
        bLocation.lng,
      );

      return distA - distB;
    });
  });

  return (
    <>
      <main class="flex-col flex-grow flex overflow-auto gap-2 p-4">
        {isLoading() ? (
          <div class="flex flex-col items-center justify-center py-12">
            <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-600">Getting your location...</p>
          </div>
        ) : (
          <For each={sortedNetworks()}>
            {(network) => <NetworkCard network={network} />}
          </For>
        )}
      </main>
      <footer class="bg-blue-500 text-white p-2 flex items-center">
        <button
          class="p-2 cursor-pointer"
          onClick={() => navigate(-1)}
          aria-label="back"
        >
          <BackIcon />
        </button>
      </footer>
    </>
  );
}
