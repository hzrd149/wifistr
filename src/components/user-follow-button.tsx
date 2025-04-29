import {
  FollowUser,
  NewContacts,
  UnfollowUser,
} from "applesauce-actions/actions";
import { ContactsQuery } from "applesauce-core/queries";
import { createMemo, from } from "solid-js";

import { toastOperation } from "../helpers/toast";
import { accounts } from "../services/accounts";
import { actions } from "../services/actions";
import { publish } from "../services/pool";
import { queryStore } from "../services/stores";

export default function UserFollowButton(props: {
  pubkey: string;
  class?: string;
}) {
  const account = from(accounts.active$);
  if (!account()) return;

  const contacts = from(
    queryStore.createQuery(ContactsQuery, account()!.pubkey),
  );
  const isFollowing = createMemo(() =>
    contacts()?.some((p) => p.pubkey === props.pubkey),
  );

  const toggle = toastOperation(
    async () => {
      if (!contacts())
        await actions.exec(NewContacts, [props.pubkey]).forEach(publish);
      else if (isFollowing()) {
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
