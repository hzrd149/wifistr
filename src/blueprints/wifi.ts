import { EventBlueprint, EventFactory } from "applesauce-factory";
import { setContent } from "applesauce-factory/operations/event";
import { WIFI_NETWORK_KIND } from "../const";
import {
  GeohashLatLng,
  includeGeohashTags,
  includeWifiTags,
} from "../operations/event/wifi";

export function WifiBlueprint(
  wifi: {
    name?: string;
    ssid: string;
    password?: string;
    security?: string;
    portal?: boolean;
    hidden?: boolean;
  },
  location: string | GeohashLatLng,
  description?: string,
): EventBlueprint {
  return (ctx) =>
    EventFactory.runProcess(
      { kind: WIFI_NETWORK_KIND },
      ctx,
      includeWifiTags(wifi),
      includeGeohashTags(location),
      description ? setContent(description) : undefined,
    );
}
