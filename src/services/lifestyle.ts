import { kinds } from "nostr-tools";
import {
  combineLatest,
  filter,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs";

import { accounts } from "./accounts";
import { addressLoader } from "./loaders";
import { defaultRelays } from "./settings";
import { eventStore } from "./stores";

export const activeMailboxes = accounts.active$.pipe(
  filter((account) => !!account),
  switchMap((account) => eventStore.mailboxes(account.pubkey)),
  startWith(undefined),
);

/** either the users outboxes or the default relays */
export const appRelays = combineLatest([
  accounts.active$.pipe(
    switchMap((account) =>
      account
        ? eventStore
            .mailboxes(account.pubkey)
            .pipe(map((mailboxes) => mailboxes?.outboxes))
        : of(undefined),
    ),
  ),
  defaultRelays,
]).pipe(
  map(([outboxes, relays]) => outboxes || relays),
  shareReplay(1),
);

// load the users metadata, contacts, and relay list when the account changes and the mailboxes are loaded
combineLatest([accounts.active$, activeMailboxes]).subscribe(
  ([account, mailboxes]) => {
    if (!account) return;

    const relays = mailboxes && mailboxes.outboxes;

    // load the users metadata
    merge(
      addressLoader({
        pubkey: account.pubkey,
        kind: kinds.Metadata,
        relays,
      }),
      addressLoader({
        pubkey: account.pubkey,
        kind: kinds.Contacts,
        relays,
      }),
      addressLoader({
        pubkey: account.pubkey,
        kind: kinds.RelayList,
        relays,
      }),
    ).subscribe();
  },
);
