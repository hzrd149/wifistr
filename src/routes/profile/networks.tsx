import { interval, startWith } from "rxjs";
import { A, RouteSectionProps, useNavigate } from "@solidjs/router";
import { createEffect, createMemo, For, from, Match, Switch } from "solid-js";
import {
  getAddressPointerForEvent,
  getTagValue,
} from "applesauce-core/helpers";
import { TimelineLoader } from "applesauce-loaders";
import { naddrEncode } from "nostr-tools/nip19";
import { NostrEvent } from "nostr-tools";

import { eventStore, queryStore } from "../../services/stores";
import { BackIcon } from "../../components/icons";
import UserAvatar from "../../components/user-avatar";
import UserName from "../../components/user-name";
import { WIFI_NETWORK_KIND } from "../../const";
import { appRelays } from "../../services/lifestyle";
import { nostrRequest } from "../../services/loaders";

export default function ProfileNetworks(props: RouteSectionProps) {
  const { pubkey } = props.params;
  const navigate = useNavigate();

  const relays = from(appRelays);
  const loader = createMemo(() => {
    if (!pubkey || !relays()) return null;

    return new TimelineLoader(
      nostrRequest,
      TimelineLoader.simpleFilterMap(relays()!, [
        { kinds: [WIFI_NETWORK_KIND], authors: [pubkey] },
      ]),
    );
  });

  // listen to the loader and add events to the store
  createEffect(() => {
    if (!loader()) return;

    return loader()!.subscribe((e) => eventStore.add(e));
  });

  // auto load timeline
  createEffect(() => {
    if (!loader()) return;

    return interval(10_000)
      .pipe(startWith(0))
      .subscribe(() => {
        loader()!.next(-Infinity);
      });
  });

  const networks = from(
    queryStore.timeline({ kinds: [WIFI_NETWORK_KIND], authors: [pubkey] }),
  );

  return (
    <>
      <main class="flex-grow overflow-auto p-4">
        <div class="flex items-center gap-2 mb-6">
          <UserAvatar pubkey={pubkey} />
          <UserName pubkey={pubkey} class="text-xl font-bold" />
          <span class="text-gray-600">Networks</span>
        </div>

        <Switch>
          <Match when={networks() && networks()!.length === 0}>
            <div class="text-center text-gray-500 mt-8">
              No networks shared yet
            </div>
          </Match>

          <Match when={networks()}>
            <div class="space-y-4">
              <For each={networks()}>
                {(wifi: NostrEvent) => (
                  <div class="bg-white rounded-lg py-2 px-4 shadow-sm">
                    <A
                      href={`/wifi/${naddrEncode(getAddressPointerForEvent(wifi))}`}
                    >
                      <h3 class="text-lg font-semibold text-blue-500">
                        {getTagValue(wifi, "name") || getTagValue(wifi, "ssid")}
                      </h3>
                    </A>
                    <div class="mt-2 text-gray-600">
                      <div>SSID: {getTagValue(wifi, "ssid")}</div>
                      <div class="mt-1 text-sm">{wifi.content}</div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Match>
        </Switch>
      </main>

      <footer class="bg-blue-500 text-white p-2 flex items-center">
        <button onClick={() => navigate(-1)} class="p-2 cursor-pointer">
          <BackIcon />
        </button>
      </footer>
    </>
  );
}
