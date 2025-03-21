import { createMemo, from } from "solid-js";
import { accounts } from "../services/accounts";
import { toastOperation } from "../helpers/toast";
import { UserContactsQuery } from "applesauce-core/queries";
import { queryStore } from "../services/stores";
import { actions } from "../services/actions";
import { FollowUser, UnfollowUser } from "applesauce-actions/actions";
import { publish } from "../services/nostr";

export default function UserFollowButton(props: {
  pubkey: string;
  class?: string;
}) {
  const account = from(accounts.active$);
  if (!account()) return;

  const contacts = from(
    queryStore.createQuery(UserContactsQuery, account()!.pubkey),
  );
  const isFollowing = createMemo(() =>
    contacts()?.some((p) => p.pubkey === props.pubkey),
  );

  const toggle = toastOperation(
    async () => {
      if (isFollowing()) {
        await actions.exec(UnfollowUser, props.pubkey).forEach(publish);
      } else {
        await actions.exec(FollowUser, props.pubkey).forEach(publish);
      }
    },
    {
      loading: "Updating...",
      success: "Added to contacts",
      error: "Failed to update",
    },
  );

  return (
    <button
      onClick={toggle.run}
      disabled={toggle.loading()}
      class={props.class}
    >
      {isFollowing() ? "Unfollow" : "Follow"}
    </button>
  );
}
