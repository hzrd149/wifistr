import Fuse from "fuse.js";
import { NostrEvent } from "nostr-tools";
import { getTagValue } from "applesauce-core/helpers";

import { WIFI_NETWORK_KIND } from "../const";
import { eventStore } from "./stores";

export type WifiSearchItem = {
  id: string;
  event: NostrEvent;
  ssid?: string;
  name?: string;
  about: string;
};

export const wifiSearch = new Fuse<WifiSearchItem>([], {
  keys: ["ssid", "name"],
});

eventStore.filters({ kinds: [WIFI_NETWORK_KIND] }).subscribe((event) => {
  const ssid = getTagValue(event, "ssid");
  const name = getTagValue(event, "name");

  wifiSearch.add({ id: event.id, event, ssid, name, about: event.content });
});
