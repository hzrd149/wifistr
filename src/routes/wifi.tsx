import { Navigate, RouteSectionProps, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, from } from "solid-js";
import { nip19, NostrEvent } from "nostr-tools";

import { BackIcon, QrCodeIcon } from "../components/icons";
import { queryStore } from "../services/stores";
import { replaceableLoader } from "../services/loaders";
import { getTagValue, mergeRelaySets } from "applesauce-core/helpers";
import { accounts } from "../services/accounts";
import { appRelays } from "../services/lifestyle";
import CopyButton from "../components/copy-button";
import UserAvatar from "../components/user-avatar";
import UserName from "../components/user-name";
import UserFollowButton from "../components/user-follow-button";

function WifiPage(props: { wifi: NostrEvent }) {
  const name = getTagValue(props.wifi, "name");
  const ssid = getTagValue(props.wifi, "ssid");
  const password = getTagValue(props.wifi, "password");
  // const hidden = getTagValue(props.wifi, "h") === "true";
  // const captive = getTagValue(props.wifi, "c") === "true";

  // const link = createWifiQrCode({
  //   ssid,
  //   password,
  //   hidden,
  // });

  // Sample WiFi network data
  const [network, setNetwork] = createSignal({
    name: "Coffee Shop WiFi",
    ssid: "CoffeeShop_Public",
    description:
      "Free WiFi available at Downtown Coffee Shop. Best connection near the window seats.",
    password: "coffee123",
    likes: 24,
    dislikes: 3,
    userLiked: false,
    userDisliked: false,
  });

  // Comments functionality
  const [comments, setComments] = createSignal([
    {
      id: 1,
      author: "WiFi_User",
      text: "Great connection speed!",
      timestamp: "2 days ago",
    },
    {
      id: 2,
      author: "Laptop_Worker",
      text: "Password worked immediately, thanks!",
      timestamp: "1 day ago",
    },
  ]);
  const [newComment, setNewComment] = createSignal("");

  // Handle like/dislike
  const handleLike = () => {
    setNetwork((prev) => {
      if (prev.userLiked) {
        return { ...prev, likes: prev.likes - 1, userLiked: false };
      } else {
        // Remove dislike if present
        const dislikeDelta = prev.userDisliked ? -1 : 0;
        return {
          ...prev,
          likes: prev.likes + 1,
          dislikes: prev.dislikes + dislikeDelta,
          userLiked: true,
          userDisliked: false,
        };
      }
    });
  };

  const handleDislike = () => {
    setNetwork((prev) => {
      if (prev.userDisliked) {
        return { ...prev, dislikes: prev.dislikes - 1, userDisliked: false };
      } else {
        // Remove like if present
        const likeDelta = prev.userLiked ? -1 : 0;
        return {
          ...prev,
          dislikes: prev.dislikes + 1,
          likes: prev.likes + likeDelta,
          userDisliked: true,
          userLiked: false,
        };
      }
    });
  };

  // Handle adding new comment
  const addComment = (e: Event) => {
    e.preventDefault();
    if (newComment().trim()) {
      setComments((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          author: "You",
          text: newComment(),
          timestamp: "Just now",
        },
      ]);
      setNewComment("");
    }
  };

  return (
    <>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-blue-600">{name}</h1>

        {/* <div class="flex gap-2">
          <a
            href={link}
            class="bg-blue-500 text-white font-lg px-8 py-2 w-full text-center rounded-full cursor-pointer"
          >
            Connect
          </a>
        </div> */}

        <div class="flex gap-2 items-center">
          <UserAvatar pubkey={props.wifi.pubkey} />
          <UserName
            class="text-lg font-bold truncate"
            pubkey={props.wifi.pubkey}
          />

          <UserFollowButton
            pubkey={props.wifi.pubkey}
            class="ml-auto bg-blue-500 text-white px-4 py-2 rounded-full cursor-pointer"
          />
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <div class="font-semibold">SSID:</div>
          <div class="flex items-center gap-2">
            <code class="font-mono bg-gray-50 px-2 py-1 rounded-sm select-all flex-grow">
              {ssid}
            </code>
            {ssid && <CopyButton text={ssid} />}
          </div>

          <div class="font-semibold">Password:</div>
          <div class="flex items-center gap-2">
            <code class="font-mono bg-gray-50 px-2 py-1 rounded-sm select-all flex-grow">
              {password}
            </code>
            {password && <CopyButton text={password} />}
          </div>
        </div>

        <p class="mt-4 text-gray-700">{props.wifi.content}</p>

        <div class="mt-5 flex items-center gap-4">
          <button
            onClick={handleLike}
            class={`flex items-center gap-1 px-3 py-1 rounded-full ${network().userLiked ? "bg-blue-100 text-blue-700" : "bg-gray-50"}`}
          >
            <span class="material-icons text-xl">thumb_up</span>
            <span>{network().likes}</span>
          </button>

          <button
            onClick={handleDislike}
            class={`flex items-center gap-1 px-3 py-1 rounded-full ${network().userDisliked ? "bg-red-100 text-red-700" : "bg-gray-50"}`}
          >
            <span class="material-icons text-xl">thumb_down</span>
            <span>{network().dislikes}</span>
          </button>
        </div>
      </div>

      {/* Comments Section - Removed card styling */}
      <div>
        <h2 class="text-xl font-semibold mb-4">Comments</h2>

        {/* Comment List */}
        <div class="space-y-4 mb-6">
          <For each={comments()}>
            {(comment) => (
              <div class="border-b pb-3">
                <div class="flex justify-between">
                  <span class="font-medium">{comment.author}</span>
                  <span class="text-sm text-gray-500">{comment.timestamp}</span>
                </div>
                <p class="mt-1 text-gray-700">{comment.text}</p>
              </div>
            )}
          </For>
        </div>

        {/* Add Comment Form */}
        <form onSubmit={addComment} class="mt-4">
          <textarea
            value={newComment()}
            onInput={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            class="w-full border rounded-lg p-2 min-h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Post Comment
          </button>
        </form>
      </div>
    </>
  );
}

export default function WifiView(props: RouteSectionProps) {
  const account = from(accounts.active$);
  const navigate = useNavigate();
  const { naddr } = props.params;
  if (!naddr) return <Navigate href="/" />;

  const decoded = nip19.decode(naddr);
  if (decoded.type !== "naddr") return <Navigate href="/" />;

  const pointer = decoded.data;
  const relays = from(appRelays);

  // load the wifi event
  createEffect(() => {
    replaceableLoader.next({
      ...pointer,
      relays: mergeRelaySets(pointer.relays, relays()),
    });
  });

  const wifi = from(
    queryStore.replaceable(pointer.kind, pointer.pubkey, pointer.identifier),
  );

  return (
    <>
      <main class="flex-col flex-grow flex overflow-auto p-4 bg-gray-100">
        {wifi() ? <WifiPage wifi={wifi()!} /> : <div>Loading...</div>}
      </main>

      <footer class="bg-blue-500 text-white p-2 flex items-center gap-2">
        <button class="p-2 cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>

        <div class="flex-grow"></div>

        {wifi() && account()?.pubkey === wifi()?.pubkey && (
          <button class="p-2 cursor-pointer" aria-label="edit">
            Edit
          </button>
        )}
        <button class="p-2 cursor-pointer" aria-label="show qr code">
          <QrCodeIcon />
        </button>
      </footer>
    </>
  );
}
