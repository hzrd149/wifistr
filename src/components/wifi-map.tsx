import { createEffect, onCleanup } from "solid-js";
import { getReplaceableIdentifier, safeParse } from "applesauce-core/helpers";
import { useNavigate } from "@solidjs/router";
import ngeohash from "ngeohash";

import L, { LatLng, LatLngBounds } from "leaflet";
import { LocateControl } from "leaflet.locatecontrol";

import { nip19, NostrEvent } from "nostr-tools";
import { WifiMarkerIcon } from "./markers";

function WifiMap(props: {
  networks?: NostrEvent[];
  class?: string;
  center?: LatLng;
  cacheView?: string;
  onCenterChange?: (center: LatLng) => void;
  onZoomChange?: (zoom: number) => void;
  onBBoxChange?: (bbox: LatLngBounds) => void;
}) {
  const navigate = useNavigate();
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

      // update bbox when map moves or zooms
      map.on("moveend", () => {
        if (props.onBBoxChange) props.onBBoxChange(map!.getBounds());
        if (props.onCenterChange) props.onCenterChange(map!.getCenter());
      });
      map.on("zoomend", () => {
        if (props.onBBoxChange) props.onBBoxChange?.(map!.getBounds());
        if (props.onZoomChange) props.onZoomChange?.(map!.getZoom());
      });
    }
  });

  // save map center when move
  createEffect(() => {
    props.center;

    if (props.cacheView && map) {
      // load center from cache
      if (!props.center) {
        const cached = safeParse<{ center: LatLng; zoom: number }>(
          localStorage.getItem(props.cacheView + "-map-position") ?? "",
        );
        if (cached) {
          map.setView(cached.center, cached.zoom);
        }
      }

      // save updates to local storage
      const listener = () => {
        localStorage.setItem(
          props.cacheView + "-map-position",
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

  createEffect(() => {
    props.networks;

    // update the wifi networks on the map
    if (map && props.networks) {
      markersLayer.clearLayers();

      for (const network of props.networks) {
        // get the most precise geohash
        const geohash = network.tags
          .filter((t) => t[0] === "g" && t[1])
          .reduce((g, t) => (t[1].length > g.length ? t[1] : g), "");
        if (!geohash) continue;

        const location = ngeohash.decode(geohash);

        const marker = L.marker([location.latitude, location.longitude], {
          icon: new WifiMarkerIcon(),
        });
        marker.on("click", () => {
          navigate(
            `/wifi/${nip19.neventEncode({
              id: network.id,
              kind: network.kind,
              author: network.pubkey,
            })}`,
          );
        });
        marker.addTo(markersLayer);
      }
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

export default WifiMap;
