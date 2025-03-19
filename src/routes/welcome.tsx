import { A, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { SimpleSigner } from "applesauce-signers";
import { CreateProfile } from "applesauce-actions/actions";
import { SimpleAccount } from "applesauce-accounts/accounts";
import { modifyPublicTags } from "applesauce-factory/operations/event";

import { NextIcon, SettingsIcon } from "../components/icons";
import { accounts } from "../services/accounts";
import { actions, factory } from "../services/actions";
import { publish } from "../services/nostr";
import { kinds } from "nostr-tools";
import { addOutboxRelay } from "applesauce-factory/operations/tag";
import { DEFAULT_LOOKUP_RELAYS, DEFAULT_RELAYS } from "../const";

export default function WelcomeView() {
  const navigate = useNavigate();

  const [loading, setLoading] = createSignal(false);
  const createProfile = async () => {
    setLoading(true);
    const { uniqueNamesGenerator, adjectives, colors, animals } = await import(
      "unique-names-generator"
    );

    const signer = new SimpleSigner();

    const account = new SimpleAccount(await signer.getPublicKey(), signer);
    accounts.addAccount(account);
    accounts.setActive(account);

    // create default outboxes for user
    const mailboxes = await account.signEvent(
      await factory.build(
        { kind: kinds.RelayList },
        modifyPublicTags(...DEFAULT_RELAYS.map(addOutboxRelay)),
      ),
    );
    publish(mailboxes, [...DEFAULT_RELAYS, ...DEFAULT_LOOKUP_RELAYS]);

    // generate random profile
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: " ",
      style: "capital",
    });
    await actions
      .exec(CreateProfile, {
        name: randomName,
        picture: `https://robohash.org/${account.pubkey}`,
      })
      .forEach((event) =>
        publish(event, [...DEFAULT_RELAYS, ...DEFAULT_LOOKUP_RELAYS]),
      );

    setLoading(false);
    navigate("/");
  };

  return (
    <>
      <main class="flex flex-grow h-full overflow-auto flex-col items-center justify-center p-4">
        <h1 class="text-4xl font-bold mb-2">wifistr</h1>
        <p class="text-lg text-gray-600 mb-8">
          open wifi maps powered by nostr
        </p>

        <button
          class="inline-block px-8 py-4 bg-blue-500 text-white rounded-lg text-xl font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
          onClick={createProfile}
          disabled={loading()}
        >
          {loading() ? "loading..." : "Get Started"}
        </button>

        <A
          href="/signin"
          class="text-sm text-blue-500 hover:text-blue-700 transition-colors p-2 mt-2"
        >
          signin with existing nostr account
        </A>
      </main>

      <footer class="flex justify-between p-2 flex-shrink-0">
        <A href="/settings" class="p-2">
          <SettingsIcon />
        </A>
        <A href="/" class="p-2">
          <NextIcon />
        </A>
      </footer>
    </>
  );
}
