import {
  createTimelineLoader,
  TimelineLoader,
} from "applesauce-loaders/loaders";
import { WIFI_NETWORK_KIND } from "../const";
import { eventStore } from "./stores";
import { pool } from "./pool";
import { cacheRequest } from "./cache";

export const LOADERS_PRECISION = 5;

const loaders = new Map<string, TimelineLoader>();

export function getTimelineLoader(geohash: string, relays: string[]) {
  if (geohash.length !== LOADERS_PRECISION)
    geohash = geohash.slice(0, LOADERS_PRECISION);

  if (!loaders.has(geohash)) {
    const loader = createTimelineLoader(
      pool,
      relays,
      {
        kinds: [WIFI_NETWORK_KIND],
        "#g": [geohash],
      },
      { eventStore, cache: cacheRequest },
    );

    loaders.set(geohash, loader);
    return loader;
  }

  return loaders.get(geohash)!;
}
