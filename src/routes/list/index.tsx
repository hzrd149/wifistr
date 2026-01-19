import { useNavigate } from "@solidjs/router";
import { onlyEvents } from "applesauce-relay";
import ngeohash from "ngeohash";
import { switchMap } from "rxjs";
import { createEffect, createMemo, For, from } from "solid-js";

import { BackIcon } from "../../components/icons";
import { WIFI_NETWORK_KIND } from "../../const";
import { calculateDistance, getLatLongFromEvent } from "../../helpers/geohash";
import { appRelays } from "../../services/lifestyle";
import { location$ } from "../../services/location";
import { pool } from "../../services/pool";
import { eventStore } from "../../services/stores";
import NetworkCard from "./components/wifi-card";

const LOAD_AT_PERCISION = 6;

export default function WifiListView() {
  const navigate = useNavigate();
  const location = from(location$);

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
    const currentGeohashes = geohashes();
    if (!currentGeohashes) return;

    // only update if the geohashes have actually changed
    if (
      previousGeohashes &&
      currentGeohashes.every((g) => previousGeohashes!.includes(g))
    )
      return;
    previousGeohashes = currentGeohashes;

    console.log(`Requesting wifi networks around the user`, currentGeohashes);

    return appRelays
      .pipe(
        switchMap((relays) =>
          pool.req(relays, {
            kinds: [WIFI_NETWORK_KIND],
            "#g": currentGeohashes,
          }),
        ),
        onlyEvents(),
      )
      .subscribe((event) => eventStore.add(event));
  });

  const networks = from(
    eventStore.timeline({
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
      <footer class="bg-blue-500 text-white p-2 pb-safe-or-2 flex items-center">
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
