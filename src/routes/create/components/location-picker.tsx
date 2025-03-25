import { createEffect, onCleanup } from "solid-js";

import L, { LatLng } from "leaflet";
import { LocateControl } from "leaflet.locatecontrol";
import marker from "leaflet/dist/images/marker-icon.png?url";
import shadow from "leaflet/dist/images/marker-shadow.png?url";
import { addOpenStreetMapLayer } from "../../../helpers/leaflet";

export const MarkerIcon = L.Icon.extend({
  options: {
    iconUrl: marker,
    shadowUrl: shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
  },
});

function LocationPicker(props: {
  center?: LatLng;
  zoom?: number;
  onPick: (latLng: LatLng) => void;
  class?: string;
}) {
  let mapContainer: HTMLDivElement | undefined;
  let map: L.Map | undefined;

  createEffect(() => {
    if (!mapContainer) return;

    if (!map) {
      map = L.map(mapContainer).setView(
        props.center ?? [51.505, -0.09],
        props.zoom ?? 17,
      );

      addOpenStreetMapLayer(map);

      let marker = L.marker(map.getCenter(), {
        draggable: false,
        icon: new MarkerIcon(),
      }).addTo(map);

      map.on("move", () => {
        const center = map!.getCenter();
        marker.setLatLng(center);
      });
      map.on("zoom", () => {
        const center = map!.getCenter();
        marker.setLatLng(center);
      });

      map.on("moveend", () => {
        const center = map!.getCenter();
        props.onPick(center);
      });

      const locate = new LocateControl({
        position: "topleft",
        keepCurrentZoomLevel: true,
        cacheLocation: true,
        locateOptions: {
          enableHighAccuracy: true,
        },
      });
      map.addControl(locate);

      // get the users position if no center is provided
      if (!props.center) locate.start();
      return () => {
        locate.stop();
      };
    }
  });

  onCleanup(() => {
    if (map) map.remove();
  });

  return (
    <div
      ref={mapContainer}
      style={{ height: "100%", width: "100%" }}
      class={props.class}
    ></div>
  );
}

export default LocationPicker;
