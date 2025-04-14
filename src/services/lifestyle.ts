import {
  combineLatest,
  filter,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs";
import { kinds } from "nostr-tools";
import { MailboxesQuery } from "applesauce-core/queries";

import { accounts } from "./accounts";
import { replaceableLoader } from "./loaders";
import { queryStore } from "./stores";
import { defaultRelays } from "./settings";

export const activeMailboxes = accounts.active$.pipe(
  filter((account) => !!account),
  switchMap((account) =>
    queryStore.createQuery(MailboxesQuery, account.pubkey),
  ),
  startWith(undefined),
);

/** either the users outboxes or the default relays */
export const appRelays = combineLatest([
  accounts.active$.pipe(
    switchMap((account) =>
      account
        ? queryStore
            .createQuery(MailboxesQuery, account.pubkey)
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
    replaceableLoader.next({
      pubkey: account.pubkey,
      kind: kinds.Metadata,
      relays,
    });
    replaceableLoader.next({
      pubkey: account.pubkey,
      kind: kinds.Contacts,
      relays,
    });
    replaceableLoader.next({
      pubkey: account.pubkey,
      kind: kinds.RelayList,
      relays,
    });
  },
);
