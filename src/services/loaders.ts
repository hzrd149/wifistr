import {
  NostrRequest,
  ReplaceableLoader,
  SingleEventLoader,
  TagValueLoader,
} from "applesauce-loaders";
import { kinds } from "nostr-tools";
import { COMMENT_KIND } from "applesauce-core/helpers";

import { eventStore } from "./stores";
import { lookupRelays } from "./settings";
import { cacheRequest } from "./cache";
import { pool } from "./pool";

export const nostrRequest: NostrRequest = (relays, filters) =>
  pool.req(relays, filters);

export const replaceableLoader = new ReplaceableLoader(nostrRequest, {
  cacheRequest,
});
export const singleEventLoader = new SingleEventLoader(nostrRequest, {
  cacheRequest,
});
export const reactionsLoader = new TagValueLoader(nostrRequest, "e", {
  cacheRequest,
  kinds: [kinds.Reaction],
});
export const commentsLoader = new TagValueLoader(nostrRequest, "E", {
  cacheRequest,
  kinds: [COMMENT_KIND],
});

// Start the loader and send any events to the event store
replaceableLoader.subscribe((event) => eventStore.add(event));
singleEventLoader.subscribe((event) => eventStore.add(event));
reactionsLoader.subscribe((event) => eventStore.add(event));
commentsLoader.subscribe((event) => eventStore.add(event));

lookupRelays.subscribe((relays) => {
  replaceableLoader.lookupRelays = relays;
});
