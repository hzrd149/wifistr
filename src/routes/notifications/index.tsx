import { Navigate, useNavigate } from "@solidjs/router";
import { COMMENT_KIND } from "applesauce-core/helpers";
import { onlyEvents } from "applesauce-relay";
import { kinds } from "nostr-tools";
import { switchMap } from "rxjs";
import { createEffect, createMemo, For, from, Match, Switch } from "solid-js";

import { BackIcon, NotificationIcon } from "../../components/icons";
import { WIFI_NETWORK_KIND } from "../../const";
import { accounts } from "../../services/accounts";
import { appRelays } from "../../services/lifestyle";
import { pool } from "../../services/pool";
import { eventStore } from "../../services/stores";
import CommentNotification from "./components/comment";

export default function NotificationsView() {
  const navigate = useNavigate();
  const account = from(accounts.active$);

  if (!account()) return <Navigate href="/signin" />;

  const accountFilters = createMemo(() => [
    {
      kinds: [COMMENT_KIND],
      "#K": [WIFI_NETWORK_KIND.toString()],
      "#P": [account()!.pubkey],
    },
    {
      kinds: [COMMENT_KIND],
      "#k": [COMMENT_KIND.toString()],
      "#p": [account()!.pubkey],
    },
    {
      kinds: [kinds.Reaction],
      "#k": [WIFI_NETWORK_KIND.toString()],
      "#p": [account()!.pubkey],
    },
  ]);

  // Fetch notifications for the user
  createEffect(() => {
    const filters = accountFilters();
    const currentAccount = account();
    if (!currentAccount) return;

    return appRelays
      .pipe(
        switchMap((relays) => pool.req(relays, filters)),
        onlyEvents(),
      )
      .subscribe((event) => eventStore.add(event));
  });

  const notifications = from(eventStore.timeline(accountFilters()));

  // Sort notifications by timestamp
  const sortedNotifications = createMemo(() => {
    const events = notifications();
    if (!events) return;

    return Array.from(events).sort((a, b) => b.created_at - a.created_at);
  });

  return (
    <>
      <main class="flex-col flex-grow flex overflow-auto gap-2 p-4">
        <For
          each={sortedNotifications()}
          fallback={
            <div class="flex flex-col items-center justify-center flex-grow text-gray-500">
              <NotificationIcon class="size-12 mb-4" />
              <h3 class="text-lg font-semibold mb-2">Nothing here yet!</h3>
              <p class="text-sm text-center">
                Notifications will appear when someone comments on your networks
              </p>
            </div>
          }
        >
          {(notification) => (
            <Switch>
              <Match when={notification.kind === COMMENT_KIND}>
                <CommentNotification comment={notification} />
              </Match>
              {/* <Match when={notification.kind === kinds.Reaction}>
                <ReactionNotification reaction={notification} />
              </Match> */}
            </Switch>
          )}
        </For>
      </main>
      <footer class="bg-blue-500 text-white p-2 flex items-center">
        <button
          class="p-2 cursor-pointer"
          onClick={() => navigate(-1)}
          aria-label="back"
        >
          <BackIcon />
        </button>
      </footer>
    </>
  );
}
