import { kinds } from "nostr-tools";
import { MailboxesQuery } from "applesauce-core/queries";

import { accounts } from "./accounts";
import { replaceableLoader } from "./loaders";
import { combineLatest, filter, of, startWith, switchMap } from "rxjs";
import { queryStore } from "./stores";
import { rxNostr } from "./nostr";
import { defaultRelays } from "./settings";

export const activeMailboxes = accounts.active$.pipe(
  filter((account) => !!account),
  switchMap((account) =>
    queryStore.createQuery(MailboxesQuery, account.pubkey),
  ),
  startWith(undefined),
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

// set the default relays when the account changes
combineLatest([
  accounts.active$.pipe(
    switchMap((account) =>
      account
        ? queryStore.createQuery(MailboxesQuery, account.pubkey)
        : of(undefined),
    ),
  ),
  defaultRelays,
]).subscribe(([mailboxes, defaultRelays]) => {
  if (mailboxes) {
    console.log("Setting default relays to", mailboxes.outboxes);
    rxNostr.setDefaultRelays(mailboxes.outboxes);
  } else {
    console.log("Setting default relays to", defaultRelays);
    rxNostr.setDefaultRelays(defaultRelays);
  }
});
