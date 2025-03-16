import { createEffect, onCleanup } from "solid-js";
import L, { LatLng } from "leaflet";
import { LocateControl } from "leaflet.locatecontrol";

import "leaflet/dist/leaflet.css";
import "leaflet.locatecontrol/dist/L.Control.Locate.css";

type Marker = LatLng & {
  popup?: string;
};

function Map(props: { markers?: Marker[]; class?: string; center?: LatLng }) {
  let mapContainer: HTMLDivElement | undefined;
  let map: L.Map | undefined;
  const markersLayer = L.layerGroup();

  createEffect(() => {
    if (!mapContainer) return;

    if (!map) {
      map = L.map(mapContainer).setView([51.505, -0.09], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // locate control
      const locate = new LocateControl({
        position: "topleft",
        drawCircle: true,
        keepCurrentZoomLevel: false,
        setView: "always",
        cacheLocation: true,
        locateOptions: {
          enableHighAccuracy: true,
          watch: true,
        },
      });
      map.addControl(locate);

      markersLayer.addTo(map);
    }

    markersLayer.clearLayers();
    props.markers?.forEach(({ lat, lng, popup }) => {
      const marker = L.marker([lat, lng]);
      if (popup) {
        marker.bindPopup(popup);
      }
      marker.addTo(markersLayer);
    });
  });

  createEffect(() => {
    if (props.center && map) {
      map.setView([props.center.lat, props.center.lng]);
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

export default Map;
