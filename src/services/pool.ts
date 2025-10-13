import { firstValueFrom, lastValueFrom } from "rxjs";
import { RelayPool } from "applesauce-relay";
import { NostrEvent } from "nostr-tools";

import { eventStore } from "./stores";
import { defaultRelays } from "./settings";
import { appRelays } from "./lifestyle";

export const pool = new RelayPool();

export async function publish(
  event: NostrEvent,
  relays?: string[],
): Promise<void> {
  console.log("Publishing", event);

  eventStore.add(event);

  if (!relays) relays = await firstValueFrom(appRelays);
  if (!relays) relays = defaultRelays.getValue();

  return lastValueFrom(pool.event(relays, event)).then(() => {});
}
