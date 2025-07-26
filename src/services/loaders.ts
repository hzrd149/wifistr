import { COMMENT_KIND } from "applesauce-core/helpers";
import {
  createAddressLoader,
  createEventLoader,
  createReactionsLoader,
  createTagValueLoader,
} from "applesauce-loaders/loaders";
import { cacheRequest } from "./cache";
import { pool } from "./pool";
import { eventStore } from "./stores";
import { defaultRelays, lookupRelays } from "./settings";

export const addressLoader = createAddressLoader(pool, {
  cacheRequest,
  extraRelays: defaultRelays,
  eventStore,
  lookupRelays,
});
export const eventLoader = createEventLoader(pool, {
  cacheRequest,
  eventStore,
});
export const reactionsLoader = createReactionsLoader(pool, {
  cacheRequest,
  eventStore,
});
export const commentsLoader = createTagValueLoader(pool, "E", {
  cacheRequest,
  eventStore,
  kinds: [COMMENT_KIND],
});

// Attach loaders to the event store
eventStore.eventLoader = eventLoader;
eventStore.addressableLoader = addressLoader;
eventStore.replaceableLoader = addressLoader;
