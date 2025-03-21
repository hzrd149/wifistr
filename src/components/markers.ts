import L from "../lib/leaflet";

import wifiIcon from "../assets/wifi-marker.svg";

export const WifiMarkerIcon = L.Icon.extend({
  options: {
    iconUrl: wifiIcon,
    iconRetinaUrl: wifiIcon,
    shadowUrl: "",

    iconSize: [24, 24],
    shadowSize: [0, 0],
    iconAnchor: [12, 12],
    shadowAnchor: [0, 0],
    popupAnchor: [12, 12],
  },
});
