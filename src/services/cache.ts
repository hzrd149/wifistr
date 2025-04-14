import { isFromCache } from "applesauce-core/helpers";
import { openDB, getEventsForFilters, addEvents, clearDB } from "nostr-idb";
import { Filter, NostrEvent } from "nostr-tools";
import { from, Subject } from "rxjs";
import { bufferTime, distinct, filter, mergeMap } from "rxjs/operators";
import { eventStore } from "./stores";

const db = await openDB();
export function cacheRequest(filters: Filter[]) {
  return from(getEventsForFilters(db, filters)).pipe(
    mergeMap((events) => events),
  );
}

export function clearCache() {
  return clearDB(db);
}

export const cacheEvent = new Subject<NostrEvent>();

cacheEvent
  .pipe(
    // ignore events from cache
    filter((e) => !isFromCache(e)),
    // only save events once
    distinct((e) => e.id),
    // batch by time or max 1k
    bufferTime(10_000, undefined, 1000),
    // ignore empty buffers
    filter((b) => b.length > 0),
  )
  .subscribe(async (events: NostrEvent[]) => {
    console.log(`Saving ${events.length} events to cache`);
    addEvents(db, events);
  });

// Save all new events to the cache
eventStore.inserts
  .pipe(filter((e) => !isFromCache(e)))
  .subscribe((e) => cacheEvent.next(e));
