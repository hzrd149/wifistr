import { A, Location, RouteSectionProps } from "@solidjs/router";
import Map from "../components/map";
import { type LatLng } from "leaflet";
import { from } from "solid-js";

import {
  PlusIcon,
  QrCodeIcon,
  SearchIcon,
  UserIcon,
} from "../components/icons";
import { accounts } from "../services/accounts";
import UserAvatar from "../components/user-avatar";

function HomeView(props: RouteSectionProps) {
  const location: Location<{ center?: LatLng }> = props.location;
  const account = from(accounts.active$);

  return (
    <>
      <div class="h-dvh bg-gray-100 flex flex-col overflow-hidden">
        <main class="flex-col flex-grow flex">
          <Map
            class="grow"
            markers={[]}
            center={location.state?.center}
            cache="home"
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
          <a class="p-2" href="/create">
            <PlusIcon />
          </a>
        </footer>
      </div>
    </>
  );
}

export default HomeView;
