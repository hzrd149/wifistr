import { createRxNostr, noopVerifier } from "rx-nostr";
import { filter, lastValueFrom, map } from "rxjs";
import { NostrEvent } from "nostr-tools";

import { eventStore } from "./stores";
import { cacheEvent } from "./cache";
import { isFromCache } from "applesauce-core/helpers";

export const rxNostr = createRxNostr({
  // skip verification here because we are going to verify events at the event store
  skipVerify: true,
  verifier: noopVerifier,
});

// save all events to the cache
rxNostr
  .createAllEventObservable()
  .pipe(
    map((p) => p.event),
    filter((e) => !isFromCache(e)),
  )
  .subscribe(cacheEvent);

export function publish(event: NostrEvent, relays?: string[]): Promise<void> {
  console.log("Publishing", event);

  eventStore.add(event);

  // save event to the cache
  cacheEvent.next(event);

  return lastValueFrom(
    relays ? rxNostr.send(event, { on: { relays } }) : rxNostr.send(event),
  ).then(() => {});
}
