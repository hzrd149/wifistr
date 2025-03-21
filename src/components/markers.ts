import L from "../lib/leaflet";

import wifiIcon from "../assets/wifi-marker.svg";

export const WifiMarkerIcon = L.Icon.extend({
  options: {
    iconUrl: wifiIcon,
    iconRetinaUrl: wifiIcon,
    shadowUrl: "",

    iconSize: [32, 32],
    shadowSize: [0, 0],
    iconAnchor: [16, 16],
    shadowAnchor: [0, 0],
    popupAnchor: [16, 16],
  },
});
