import { createEffect, onCleanup } from "solid-js";
import L, { LatLng } from "leaflet";
import { LocateControl } from "leaflet.locatecontrol";

import "leaflet/dist/leaflet.css";
import "leaflet.locatecontrol/dist/L.Control.Locate.css";
import { createFileMetadataTags } from "applesauce-factory/helpers/file-metadata";
import { safeParse } from "applesauce-core/helpers";

type Marker = LatLng & {
  popup?: string;
};

function Map(props: {
  markers?: Marker[];
  class?: string;
  center?: LatLng;
  cache?: string;
}) {
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

  // save map center when move
  createEffect(() => {
    props.center;

    if (props.cache && map) {
      // load center from cache
      if (!props.center) {
        const cached = safeParse<{ center: LatLng; zoom: number }>(
          localStorage.getItem(props.cache + "-map-position") ?? "",
        );
        if (cached) {
          map.setView(cached.center, cached.zoom);
        }
      }

      // save updates to local storage
      const listener = () => {
        localStorage.setItem(
          props.cache + "-map-position",
          JSON.stringify({ center: map!.getCenter(), zoom: map!.getZoom() }),
        );
      };

      map.addEventListener("moveend", listener);
      map.addEventListener("zoomend", listener);
      return () => {
        map!.removeEventListener("moveend", listener);
        map!.removeEventListener("zoomend", listener);
      };
    }
  });

  // center the map when props change
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
