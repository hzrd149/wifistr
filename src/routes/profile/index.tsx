import { A, Navigate, RouteSectionProps, useNavigate } from "@solidjs/router";
import { createEffect, createMemo, from } from "solid-js";
import { kinds } from "nostr-tools";
import { ProfileQuery } from "applesauce-core/queries";
import { of, switchMap } from "rxjs";

import { accounts } from "../../services/accounts";
import {
  BackIcon,
  NotificationIcon,
  SettingsIcon,
} from "../../components/icons";
import UserAvatar from "../../components/user-avatar";
import { queryStore } from "../../services/stores";
import { replaceableLoader } from "../../services/loaders";

function ProfileView(props: RouteSectionProps) {
  const navigate = useNavigate();
  const account = from(accounts.active$);
  const pubkey = createMemo(() => props.params.pubkey || account()?.pubkey);
  const self = createMemo(() => pubkey() === account()?.pubkey);

  // Handle logout functionality
  const handleLogout = () => {
    accounts.removeAccount(account()!.pubkey);
    accounts.clearActive();
    navigate("/");
  };

  // get the profile for the active account
  const profile = from(
    accounts.active$.pipe(
      switchMap((account) =>
        account
          ? queryStore.createQuery(ProfileQuery, account.pubkey)
          : of(undefined),
      ),
    ),
  );

  // Load the kind 0 event for the active account
  createEffect(() => {
    if (pubkey())
      replaceableLoader.next({
        pubkey: pubkey()!,
        kind: kinds.Metadata,
      });
  });

  if (!account()) return <Navigate href="/welcome" />;

  return (
    <>
      <main class="flex-grow flex flex-col items-center justify-center p-4">
        <div class="text-center mb-8">
          <UserAvatar
            pubkey={account()!.pubkey}
            size={128}
            class="mx-auto mb-4 shadow-md"
          />
          <h1 class="text-2xl font-bold">{profile()?.name || "Unknown"}</h1>
          {profile()?.about && (
            <p class="text-sm text-gray-600 mt-2">{profile()?.about}</p>
          )}
        </div>

        <A
          href={`/profile/${pubkey()}/networks`}
          class="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
        >
          Networks
        </A>

        {self() && (
          <button
            onClick={handleLogout}
            class="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 cursor-pointer rounded transition-colors"
          >
            Logout
          </button>
        )}
      </main>

      <footer class="bg-blue-500 text-white p-2 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          class="p-2 cursor-pointer"
          aria-label="back"
        >
          <BackIcon />
        </button>

        <div class="flex gap-2">
          <A href="/notifications" class="p-2" aria-label="notifications">
            <NotificationIcon />
          </A>
          <A href="/settings" class="p-2" aria-label="settings">
            <SettingsIcon />
          </A>
        </div>
      </footer>
    </>
  );
}

export default ProfileView;
