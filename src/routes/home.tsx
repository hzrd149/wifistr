import { A, Location, RouteSectionProps, useNavigate } from "@solidjs/router";
import WifiMap from "../components/wifi-map";
import { LatLngBounds, type LatLng } from "leaflet";
import { createEffect, createSignal, from } from "solid-js";
import ngeohash from "ngeohash";

import {
  PlusIcon,
  QrCodeIcon,
  SearchIcon,
  UserIcon,
} from "../components/icons";
import { accounts } from "../services/accounts";
import UserAvatar from "../components/user-avatar";
import {
  getTimelineLoader,
  LOADERS_PRECISION,
} from "../services/location-loaders";
import { activeMailboxes } from "../services/lifestyle";
import { queryStore } from "../services/stores";
import { WIFI_NETWORK_KIND } from "../const";

const LOADER_MAX_ZOOM = 13;

function HomeView(props: RouteSectionProps) {
  const location: Location<{ center?: LatLng }> = props.location;
  const account = from(accounts.active$);
  const navigate = useNavigate();

  const [zoom, setZoom] = createSignal(0);
  const [center, setCenter] = createSignal<LatLng | undefined>(undefined);
  const [geohashes, setGeohashes] = createSignal<string[]>([]);

  const onBBoxChange = (bbox: LatLngBounds) => {
    const lat = [bbox.getSouth(), bbox.getNorth()];
    const lng = [bbox.getWest(), bbox.getEast()];

    const geohashes = ngeohash.bboxes(
      Math.min(...lat),
      Math.min(...lng),
      Math.max(...lat),
      Math.max(...lng),
      LOADERS_PRECISION,
    );
    setGeohashes(geohashes);
  };

  const mailboxes = from(activeMailboxes);

  createEffect(() => {
    const relays = mailboxes()?.outboxes;

    if (zoom() < LOADER_MAX_ZOOM) return;
    if (!relays) return;

    // trigger loaders when geohashes change
    console.log(`Loading events for`, geohashes());

    for (const geohash of geohashes()) {
      getTimelineLoader(geohash, relays).next(Infinity);
    }
  });

  const networks = from(queryStore.timeline({ kinds: [WIFI_NETWORK_KIND] }));

  return (
    <>
      <div class="h-dvh bg-gray-100 flex flex-col overflow-hidden">
        <main class="flex-col flex-grow flex">
          <WifiMap
            class="grow"
            networks={networks()}
            center={location.state?.center}
            cacheView="home"
            onBBoxChange={onBBoxChange}
            onZoomChange={setZoom}
            onCenterChange={setCenter}
          />
        </main>
        <footer class="bg-blue-500 text-white p-2 flex items-center gap-2">
          {account() ? (
            <A href="/profile">
              <UserAvatar pubkey={account()!.pubkey} class=" bg-white" />
            </A>
          ) : (
            <A href="/welcome" class="p-2">
              <UserIcon />
            </A>
          )}
          <a href="/search" class="p-2">
            <SearchIcon />
          </a>
          <div class="flex-grow"></div>
          <a class="p-2" href="/scan">
            <QrCodeIcon />
          </a>
          <button
            class="p-2"
            onClick={() =>
              navigate("/create", {
                state: { center: center(), zoom: zoom() },
              })
            }
          >
            <PlusIcon />
          </button>
        </footer>
      </div>
    </>
  );
}

export default HomeView;
