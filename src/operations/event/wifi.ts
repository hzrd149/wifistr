import { EventOperation } from "applesauce-factory";
import {
  ensureNamedValueTag,
  ensureSingletonTag,
} from "applesauce-factory/helpers";
import ngeohash from "ngeohash";

/** Sets the wifi tags on an event */
export function includeWifiTags(wifi: {
  name?: string;
  ssid: string;
  password?: string;
  security?: string;
  captive?: boolean;
  hidden?: boolean;
}): EventOperation {
  return async (draft) => {
    let tags = Array.from(draft.tags);

    if (wifi.name) tags = ensureSingletonTag(tags, ["name", wifi.name], true);
    tags = ensureSingletonTag(tags, ["ssid", wifi.ssid], true);
    tags = ensureSingletonTag(tags, ["h", String(!!wifi.hidden)], true);
    tags = ensureSingletonTag(tags, ["c", String(!!wifi.captive)], true);

    if (wifi.password)
      tags = ensureSingletonTag(tags, ["password", wifi.password], true);
    if (wifi.security)
      tags = ensureSingletonTag(tags, ["security", wifi.security], true);

    return { ...draft, tags };
  };
}

export type GeohashLatLng = {
  lat: number;
  lng: number;
  precision?: number;
};

/** Includes the "g" geohash tags on an event */
export function includeGeohashTags(
  geohash: string | GeohashLatLng,
): EventOperation {
  return async (draft) => {
    let tags = Array.from(draft.tags);

    if (typeof geohash !== "string")
      geohash = ngeohash.encode(
        geohash.lat,
        geohash.lng,
        geohash.precision ?? 9,
      );

    // include a "g" tag for each level of precision
    for (let i = 0; i < geohash.length; i++) {
      tags = ensureNamedValueTag(tags, ["g", geohash.slice(0, i + 1)]);
    }

    return { ...draft, tags };
  };
}
