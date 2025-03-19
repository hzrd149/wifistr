import { createRxNostr, noopVerifier } from "rx-nostr";
import { accounts } from "./accounts";
import { of, switchMap } from "rxjs";
import { eventStore, queryStore } from "./stores";
import { MailboxesQuery } from "applesauce-core/queries";
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

// subscribe to the active account, then subscribe to the users mailboxes and update rxNostr
accounts.active$
  .pipe(
    switchMap((account) =>
      account
        ? queryStore.createQuery(MailboxesQuery, account.pubkey)
        : of(undefined),
    ),
  )
  .subscribe((mailboxes) => {
    if (mailboxes) rxNostr.setDefaultRelays(mailboxes.outboxes);
    else rxNostr.setDefaultRelays([]);
  });
