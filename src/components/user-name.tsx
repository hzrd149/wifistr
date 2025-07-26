import { from } from "solid-js";

import { eventStore } from "../services/stores";

export default function UserName(props: { pubkey: string; class?: string }) {
  // Create signal from the profile query observable
  const profile = from(eventStore.profile(props.pubkey));

  return (
    <span class={props.class}>
      {profile()?.display_name || profile()?.name || "anon"}
    </span>
  );
}
