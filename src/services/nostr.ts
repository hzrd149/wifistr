import { createRxNostr, noopVerifier } from "rx-nostr";
import { eventStore } from "./stores";
import { NostrEvent } from "nostr-tools";

export const rxNostr = createRxNostr({
  // skip verification here because we are going to verify events at the event store
  skipVerify: true,
  verifier: noopVerifier,
});

export function publish(event: NostrEvent, relays?: string[]) {
  rxNostr.send(event, { on: { relays } });
  eventStore.add(event);
}
