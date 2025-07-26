import { blueprint, EventBlueprint } from "applesauce-factory";
import { setContent } from "applesauce-factory/operations/content";
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
    captive?: boolean;
    hidden?: boolean;
  },
  location: string | GeohashLatLng,
  description?: string,
): EventBlueprint {
  return blueprint(
    WIFI_NETWORK_KIND,
    includeWifiTags(wifi),
    includeGeohashTags(location),
    description ? setContent(description) : undefined,
  );
}
