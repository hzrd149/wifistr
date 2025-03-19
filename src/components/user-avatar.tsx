import { createEffect, from } from "solid-js";
import { ProfileQuery } from "applesauce-core/queries";
import { kinds } from "nostr-tools";

import { queryStore } from "../services/stores";
import { replaceableLoader } from "../services/loaders";

interface UserAvatarProps {
  pubkey: string;
  class?: string;
  size?: number;
}

export default function UserAvatar(props: UserAvatarProps) {
  // Create signal from the profile query observable
  const profile = from(queryStore.createQuery(ProfileQuery, props.pubkey));

  createEffect(() => {
    // Load the kind 0 event for this pubkey
    replaceableLoader.next({
      pubkey: props.pubkey,
      kind: kinds.Metadata,
    });
  });

  return (
    <img
      src={profile()?.picture || `https://robohash.org/${props.pubkey}`}
      alt={profile()?.name || "anon"}
      class={`rounded-full object-cover ${props.class || ""}`}
      width={props.size || 40}
      height={props.size || 40}
    />
  );
}
