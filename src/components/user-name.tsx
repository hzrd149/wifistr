import { createEffect, from } from "solid-js";
import { ProfileQuery } from "applesauce-core/queries";
import { kinds } from "nostr-tools";

import { queryStore } from "../services/stores";
import { replaceableLoader } from "../services/loaders";
import { appRelays } from "../services/lifestyle";

export default function UserName(props: { pubkey: string; class?: string }) {
  // Create signal from the profile query observable
  const profile = from(queryStore.createQuery(ProfileQuery, props.pubkey));
  const relays = from(appRelays);

  createEffect(() => {
    // Load the kind 0 event for this pubkey
    replaceableLoader.next({
      pubkey: props.pubkey,
      kind: kinds.Metadata,
      relays: relays(),
    });
  });

  return (
    <span class={props.class}>
      {profile()?.display_name || profile()?.name || "anon"}
    </span>
  );
}
