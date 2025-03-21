import { TimelineLoader } from "applesauce-loaders";
import { rxNostr } from "./nostr";
import { WIFI_NETWORK_KIND } from "../const";
import { eventStore } from "./stores";

export const LOADERS_PRECISION = 5;

const loaders = new Map<string, TimelineLoader>();

export function getTimelineLoader(geohash: string, relays: string[]) {
  if (geohash.length !== LOADERS_PRECISION)
    geohash = geohash.slice(0, LOADERS_PRECISION);

  if (!loaders.has(geohash)) {
    const loader = new TimelineLoader(
      rxNostr,
      TimelineLoader.simpleFilterMap(relays, [
        { kinds: [WIFI_NETWORK_KIND], "#g": [geohash] },
      ]),
    );

    // start loader and send all events to the event store
    loader.subscribe((packet) => {
      eventStore.add(packet.event, packet.from);
    });

    loaders.set(geohash, loader);
    return loader;
  }

  return loaders.get(geohash)!;
}
