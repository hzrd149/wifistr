import { createEffect, from, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import ngeohash from "ngeohash";

import L, { LatLng, LatLngBounds } from "leaflet";
import { LocateControl } from "leaflet.locatecontrol";

import { NostrEvent } from "nostr-tools";
import { WifiMarkerIcon } from "../../../components/markers";
import { homeMapCenter } from "../../../services/settings";
import { addOpenStreetMapLayer } from "../../../helpers/leaflet";
import { naddrEncode } from "nostr-tools/nip19";
import { getAddressPointerForEvent } from "applesauce-core/helpers";

function WifiMap(props: {
  networks?: NostrEvent[];
  class?: string;
  onCenterChange?: (center: LatLng) => void;
  onZoomChange?: (zoom: number) => void;
  onBBoxChange?: (bbox: LatLngBounds) => void;
}) {
  const navigate = useNavigate();
  let mapContainer: HTMLDivElement | undefined;
  let map: L.Map | undefined;
  const markersLayer = L.layerGroup();

  const cached = from(homeMapCenter);

  // create the map
  createEffect(() => {
    if (!mapContainer) return;

    if (!map) {
      map = L.map(mapContainer);

      // set initial view from cache
      const location = cached();
      if (location && map) {
        map.setView([location.center.lat, location.center.lng], location.zoom);
      } else {
        map.setView([51.505, -0.09], 13);
      }

      addOpenStreetMapLayer(map);

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

      // save updates to local storage
      const listener = () => {
        homeMapCenter.next({
          center: map!.getCenter(),
          zoom: map!.getZoom(),
        });
      };

      map.addEventListener("moveend", listener);
      map.addEventListener("zoomend", listener);

      // TODO: it might not be necessary to remove the listener
      return () => {
        map!.removeEventListener("moveend", listener);
        map!.removeEventListener("zoomend", listener);
      };
    }
  });

  // update the wifi networks on the map
  createEffect(() => {
    props.networks;

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
          navigate(`/wifi/${naddrEncode(getAddressPointerForEvent(network))}`);
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
