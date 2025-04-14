import { A } from "@solidjs/router";
import { npubEncode } from "nostr-tools/nip19";

import UserName from "./user-name";

export default function UserLink(props: { pubkey: string; class?: string }) {
  return (
    <A href={`/profile/${npubEncode(props.pubkey)}`}>
      <UserName class={"truncate " + props.class} pubkey={props.pubkey} />
    </A>
  );
}
