import { A } from "@solidjs/router";
import { getCommentRootPointer, getTagValue } from "applesauce-core/helpers";
import { NostrEvent } from "nostr-tools";
import { naddrEncode } from "nostr-tools/nip19";
import { EMPTY } from "rxjs";
import { from } from "solid-js";

import UserAvatar from "../../../components/user-avatar";
import UserLink from "../../../components/user-link";
import { formatTimeAgo } from "../../../helpers/date";
import { eventStore } from "../../../services/stores";

export default function CommentNotification(props: { comment: NostrEvent }) {
  // Get the referenced network event id from the tags
  const root = getCommentRootPointer(props.comment);
  // const reply = createMemo(() => getCommentReplyPointer(props.comment));

  const network = from(
    root?.type === "address" ? eventStore.addressable(root) : EMPTY,
  );

  return (
    <div class="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <p>
        Comment on{" "}
        {network()
          ? getTagValue(network()!, "name") || getTagValue(network()!, "ssid")
          : "a network"}
      </p>
      <div class="flex gap-2 items-center mb-2">
        <UserAvatar class="w-8 h-8" pubkey={props.comment.pubkey} />
        <UserLink class="font-medium" pubkey={props.comment.pubkey} />
        <span class="text-sm text-gray-500 ms-auto">
          {formatTimeAgo(props.comment.created_at)}
        </span>
      </div>

      <p class="text-gray-600 text-sm">{props.comment.content}</p>

      {root?.type === "address" && (
        <A
          class="text-blue-500 hover:text-blue-600 ms-auto"
          href={`/wifi/${naddrEncode(root)}`}
        >
          View Network
        </A>
      )}
    </div>
  );
}
