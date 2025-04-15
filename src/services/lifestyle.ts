import { MailboxesQuery } from "applesauce-core/queries";
import { kinds } from "nostr-tools";
import {
  combineLatest,
  filter,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs";

import { accounts } from "./accounts";
import {
  commentsLoader,
  reactionsLoader,
  replaceableLoader,
  singleEventLoader,
} from "./loaders";
import { defaultRelays, lookupRelays } from "./settings";
import { eventStore, queryStore } from "./stores";

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

// Start the loader and send any events to the event store
replaceableLoader.subscribe((event) => eventStore.add(event));
singleEventLoader.subscribe((event) => eventStore.add(event));
reactionsLoader.subscribe((event) => eventStore.add(event));
commentsLoader.subscribe((event) => eventStore.add(event));

// Always fetch from the app relays
appRelays.subscribe((relays) => {
  replaceableLoader.extraRelays = relays;
  singleEventLoader.extraRelays = relays;
  reactionsLoader.extraRelays = relays;
  commentsLoader.extraRelays = relays;
});

// Set the fallback lookup relays
lookupRelays.subscribe((relays) => {
  replaceableLoader.lookupRelays = relays;
});
