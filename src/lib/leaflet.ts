import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.locatecontrol/dist/L.Control.Locate.css";

import marker2x from "leaflet/dist/images/marker-icon-2x.png?url";
import marker from "leaflet/dist/images/marker-icon.png?url";
import shadow from "leaflet/dist/images/marker-shadow.png?url";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
});

export default L;
