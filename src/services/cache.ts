import { persistEventsToCache } from "applesauce-core/helpers";
import { Filter, NostrEvent } from "nostr-tools";
import { Observable } from "rxjs";
import { eventStore } from "./stores";

export function cacheRequest(filters: Filter[]) {
  return new Observable<NostrEvent>((observer) => {
    const sub = window.nostrdb.filters(filters, {
      event: (event) => observer.next(event),
      error: (error) => observer.error(error),
      complete: () => observer.complete(),
    });
    return () => sub.close();
  });
}

// Save all new events to the cache
persistEventsToCache(eventStore, async (events) => {
  await Promise.allSettled(events.map((event) => window.nostrdb.add(event)));
});
