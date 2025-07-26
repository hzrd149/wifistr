import { from } from "solid-js";

import { eventStore } from "../services/stores";

export default function UserAvatar(props: {
  pubkey: string;
  class?: string;
  size?: number;
}) {
  // Create signal from the profile query observable
  const profile = from(eventStore.profile(props.pubkey));

  return (
    <img
      src={profile()?.picture || `https://robohash.org/${props.pubkey}`}
      class={`rounded-full object-cover ${props.class || ""}`}
      width={props.size || 40}
      height={props.size || 40}
    />
  );
}
