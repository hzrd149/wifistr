import Fuse from "fuse.js";
import { getTagValue } from "applesauce-core/helpers";

import { WIFI_NETWORK_KIND, WIFI_UPDATE_KIND } from "../const";
import { eventStore } from "./stores";

export type WifiSearchItem = {
  id: string;
  ssid?: string;
  name?: string;
  about: string;
};

export const wifiSearch = new Fuse<WifiSearchItem>([], {
  keys: ["ssid", "name"],
});

eventStore
  .filters({ kinds: [WIFI_NETWORK_KIND, WIFI_UPDATE_KIND] })
  .subscribe((event) => {
    const ssid = getTagValue(event, "ssid");
    const name = getTagValue(event, "name");

    const id =
      event.kind === WIFI_UPDATE_KIND ? getTagValue(event, "e") : event.id;
    if (!id) return;

    wifiSearch.add({ id, ssid, name, about: event.content });
  });
