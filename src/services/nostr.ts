import { createRxNostr, noopVerifier } from "rx-nostr";
import { lastValueFrom } from "rxjs";
import { NostrEvent } from "nostr-tools";

import { eventStore } from "./stores";

export const rxNostr = createRxNostr({
  // skip verification here because we are going to verify events at the event store
  skipVerify: true,
  verifier: noopVerifier,
});

export function publish(event: NostrEvent, relays?: string[]): Promise<void> {
  console.log("Publishing", event);

  eventStore.add(event);

  return lastValueFrom(
    relays ? rxNostr.send(event, { on: { relays } }) : rxNostr.send(event),
  ).then(() => {});
}
