import { Navigate, RouteSectionProps, useNavigate } from "@solidjs/router";
import { createEffect, createMemo, createSignal, from } from "solid-js";
import { nip19, NostrEvent } from "nostr-tools";
import QRCode from "qrcode-svg";

import {
  BackIcon,
  CloseIcon,
  DislikeIcon,
  LikeIcon,
  QrCodeIcon,
} from "../../components/icons";
import { queryStore } from "../../services/stores";
import { singleEventLoader } from "../../services/loaders";
import { getTagValue, mergeRelaySets } from "applesauce-core/helpers";
import { accounts } from "../../services/accounts";
import { appRelays } from "../../services/lifestyle";
import CopyButton from "../../components/copy-button";
import UserAvatar from "../../components/user-avatar";
import UserName from "../../components/user-name";
import UserFollowButton from "../../components/user-follow-button";
import WifiComments from "./components/wifi-comments";
import { createWifiQrCode } from "../../helpers/qr-code";
import { asyncAction } from "../../helpers/async-action";
import { factory } from "../../services/actions";
import {
  DeleteBlueprint,
  ReactionBlueprint,
} from "applesauce-factory/blueprints";
import { publish } from "../../services/nostr";
import { ReactionsQuery } from "applesauce-core/queries";

function WifiPage(props: { wifi: NostrEvent }) {
  const account = from(accounts.active$);
  const name = getTagValue(props.wifi, "name");
  const ssid = getTagValue(props.wifi, "ssid");
  const password = getTagValue(props.wifi, "password");
  const hidden = getTagValue(props.wifi, "h") === "true";
  // const captive = getTagValue(props.wifi, "c") === "true";

  const link = createWifiQrCode({
    ssid,
    password,
    hidden,
  });

  const reactions = from(queryStore.createQuery(ReactionsQuery, props.wifi));
  const likes = createMemo(() => reactions()?.filter((e) => e.content === "+"));
  const dislikes = createMemo(() =>
    reactions()?.filter((e) => e.content === "-"),
  );

  const hasLiked = createMemo(() =>
    likes()?.some((e) => e.pubkey === account()?.pubkey),
  );
  const hasDisliked = createMemo(() =>
    dislikes()?.some((e) => e.pubkey === account()?.pubkey),
  );

  const removeExistingReactions = async () => {
    const existing = reactions()?.filter((e) => e.pubkey === account()?.pubkey);

    if (existing && existing.length > 0) {
      const draft = await factory.create(
        DeleteBlueprint,
        existing,
        "Removing duplicate reactions",
      );
      await publish(await factory.sign(draft));
    }
  };

  const like = asyncAction(async () => {
    await removeExistingReactions();
    const draft = await factory.create(ReactionBlueprint, props.wifi, "+");
    await publish(await factory.sign(draft));
  });

  const dislike = asyncAction(async () => {
    await removeExistingReactions();
    const draft = await factory.create(ReactionBlueprint, props.wifi, "-");
    await publish(await factory.sign(draft));
  });

  return (
    <>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-blue-600">{name}</h1>

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
            onClick={like.run}
            class={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer ${hasLiked() ? "bg-blue-100 text-blue-700" : "bg-gray-50"}`}
            disabled={like.loading() || !account()}
          >
            <LikeIcon />
            <span>{likes()?.length ?? 0}</span>
          </button>

          <button
            onClick={dislike.run}
            class={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer ${hasDisliked() ? "bg-red-100 text-red-700" : "bg-gray-50"}`}
            disabled={dislike.loading() || !account()}
          >
            <DislikeIcon />
            <span>{dislikes()?.length ?? 0}</span>
          </button>

          <a
            href={link}
            class="bg-blue-500 text-white font-lg px-8 py-2 ms-auto text-center rounded-full cursor-pointer"
          >
            Connect
          </a>
        </div>
      </div>

      <WifiComments wifi={props.wifi} />
    </>
  );
}

export default function WifiView(props: RouteSectionProps) {
  const [showQrModal, setShowQrModal] = createSignal(false);
  const account = from(accounts.active$);
  const navigate = useNavigate();
  const { nevent } = props.params;
  if (!nevent) return <Navigate href="/" />;

  const decoded = nip19.decode(nevent);
  if (decoded.type !== "nevent") return <Navigate href="/" />;

  const pointer = decoded.data;
  const relays = from(appRelays);

  // load the wifi event
  createEffect(() => {
    singleEventLoader.next({
      ...pointer,
      relays: mergeRelaySets(pointer.relays, relays()),
    });
  });

  const wifi = from(queryStore.event(pointer.id));

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
        <button
          class="p-2 cursor-pointer"
          aria-label="show qr code"
          onClick={() => setShowQrModal(true)}
        >
          <QrCodeIcon />
        </button>
      </footer>

      {/* QR Code Modal */}
      {showQrModal() && wifi() && (
        <div
          class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowQrModal(false)}
        >
          <div
            class="bg-white p-6 rounded-lg max-w-sm w-full md:max-w-md mx-4 md:mx-0 h-auto md:h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Scan to Connect</h2>
              <button
                class="text-gray-500 hover:text-gray-800 cursor-pointer"
                onClick={() => setShowQrModal(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <div class="flex justify-center mb-4">
              <div
                innerHTML={new QRCode({
                  content: createWifiQrCode({
                    ssid: getTagValue(wifi()!, "ssid"),
                    password: getTagValue(wifi()!, "password"),
                    hidden: getTagValue(wifi()!, "h") === "true",
                  }),
                  width: 256,
                  height: 256,
                  color: "#000000",
                  background: "#ffffff",
                  ecl: "M",
                }).svg()}
              />
            </div>
            <p class="text-center text-sm text-gray-600">
              Scan this QR code with your device's camera to connect to "
              {getTagValue(wifi()!, "ssid")}"
            </p>
          </div>
        </div>
      )}
    </>
  );
}
