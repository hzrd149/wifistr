import {
  ReplaceableLoader,
  SingleEventLoader,
  TagValueLoader,
} from "applesauce-loaders";
import { kinds } from "nostr-tools";
import { COMMENT_KIND } from "applesauce-core/helpers";

import { rxNostr } from "./nostr";
import { eventStore } from "./stores";
import { lookupRelays } from "./settings";
import { cacheRequest } from "./cache";

export const replaceableLoader = new ReplaceableLoader(rxNostr, {
  cacheRequest,
});
export const singleEventLoader = new SingleEventLoader(rxNostr, {
  cacheRequest,
});
export const reactionsLoader = new TagValueLoader(rxNostr, "e", {
  cacheRequest,
  kinds: [kinds.Reaction],
});
export const commentsLoader = new TagValueLoader(rxNostr, "E", {
  cacheRequest,
  kinds: [COMMENT_KIND],
});

// Start the loader and send any events to the event store
replaceableLoader.subscribe((packet) =>
  eventStore.add(packet.event, packet.from),
);
singleEventLoader.subscribe((packet) =>
  eventStore.add(packet.event, packet.from),
);
reactionsLoader.subscribe((packet) =>
  eventStore.add(packet.event, packet.from),
);
commentsLoader.subscribe((packet) => eventStore.add(packet.event, packet.from));

lookupRelays.subscribe((relays) => {
  replaceableLoader.lookupRelays = relays;
});
