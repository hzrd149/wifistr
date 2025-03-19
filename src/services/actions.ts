import { EventFactory } from "applesauce-factory";
import { ActionHub } from "applesauce-actions";
import { eventStore } from "./stores";
import { accounts } from "./accounts";

// The event factory is used to build and modify nostr events
export const factory = new EventFactory({
  // accounts.signer is a NIP-07 signer that signs with the currently active account
  signer: accounts.signer,
});

// The action hub is used to run Actions against the event store
export const actions = new ActionHub(eventStore, factory);
