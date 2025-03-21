import { createSignal, For, from, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { TimelineQuery } from "applesauce-core/queries";
import { getTagValue } from "applesauce-core/helpers";
import { map } from "rxjs";
import { kinds } from "nostr-tools";
import { createRxOneshotReq } from "rx-nostr";
import { modifyPublicTags } from "applesauce-factory/operations/event";
import {
  addOutboxRelay,
  removeOutboxRelay,
} from "applesauce-factory/operations/tag";

import { defaultRelays, lookupRelays } from "../services/settings";
import { BackIcon, RemoveIcon } from "../components/icons";
import { publish, rxNostr } from "../services/nostr";
import { eventStore, queryStore } from "../services/stores";
import { activeMailboxes } from "../services/lifestyle";
import { toastOperation } from "../helpers/toast";
import { factory } from "../services/actions";
import { accounts } from "../services/accounts";

function RelayRow(props: { url: string; onRemove?: () => void }) {
  return (
    <div class="flex items-center justify-between p-2 border-b">
      <span>{props.url}</span>
      <button
        onClick={props.onRemove}
        class="px-3 py-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
      >
        <RemoveIcon />
      </button>
    </div>
  );
}

function AddRelayForm(props: {
  onSubmit?: (url: string) => void | Promise<void>;
}) {
  const [submitting, setSubmitting] = createSignal(false);
  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const url = formData.get("url")?.toString().trim();

    if (url && props.onSubmit) {
      setSubmitting(true);
      await props.onSubmit(url);
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }
  };

  // load online relays
  onMount(() => {
    const req = createRxOneshotReq({
      filters: [{ kinds: [30166], limit: 400 }],
    });

    return rxNostr
      .use(req, { on: { relays: ["wss://relay.nostr.watch"] } })
      .subscribe((packet) => {
        eventStore.add(packet.event, packet.from);
      });
  });

  // Subscribe to an array of relays urls from the 30166 events
  const relays = from(
    queryStore
      .createQuery(TimelineQuery, { kinds: [30166] })
      .pipe(
        map(
          (events) =>
            events
              ?.map((e) => getTagValue(e, "d"))
              .filter((url) => !!url) as string[],
        ),
      ),
  );

  return (
    <form onSubmit={handleSubmit} class="mt-4 space-y-2">
      <input
        list="relays"
        type="url"
        name="url"
        placeholder="Enter relay URL..."
        required
        class="w-full p-2 border rounded"
        disabled={submitting()}
      />
      <datalist id="relays">
        <For each={relays() ?? []}>
          {(url) => <option value={url}>{url}</option>}
        </For>
      </datalist>
      <button
        type="submit"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={submitting()}
      >
        {submitting() ? "Saving..." : "Add Relay"}
      </button>
    </form>
  );
}

function MailboxSettings() {
  const account = from(accounts.active$);
  const relays = from(activeMailboxes);

  const addRelay = toastOperation(
    async (url: string) => {
      const mailboxes = eventStore.getReplaceable(
        kinds.RelayList,
        account()!.pubkey,
      );
      if (!mailboxes) return;

      const draft = await factory.modify(
        mailboxes,
        modifyPublicTags(addOutboxRelay(url)),
      );
      await publish(await factory.sign(draft));
    },
    {
      loading: "Adding relay...",
      success: "Relay added",
      error: "Failed to add relay",
    },
  );
  const removeRelay = toastOperation(
    async (url: string) => {
      const mailboxes = eventStore.getReplaceable(
        kinds.RelayList,
        account()!.pubkey,
      );
      if (!mailboxes) return;

      const draft = await factory.modify(
        mailboxes,
        modifyPublicTags(removeOutboxRelay(url)),
      );
      await publish(await factory.sign(draft));
    },
    {
      loading: "Removing relay...",
      success: "Relay removed",
      error: "Failed to remove relay",
    },
  );

  if (account() === undefined) return null;

  return (
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold my-4">Data Relays</h1>

      <div class="border rounded bg-white">
        <For each={relays()?.outboxes}>
          {(relay) => (
            <RelayRow url={relay} onRemove={() => removeRelay.run(relay)} />
          )}
        </For>
      </div>

      <AddRelayForm onSubmit={addRelay.run} />
    </div>
  );
}

function DefaultRelaysSettings() {
  const relays = from(defaultRelays);

  const addRelay = (url: string) => {
    const current = defaultRelays.getValue();
    if (!current.includes(url)) {
      defaultRelays.next([...current, url]);
    }
  };

  const removeRelay = (url: string) => {
    const current = defaultRelays.getValue();
    defaultRelays.next(current.filter((relay) => relay !== url));
  };

  return (
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold my-4">Data Relays</h1>

      <div class="border rounded bg-white">
        <For each={relays()}>
          {(relay) => (
            <RelayRow url={relay} onRemove={() => removeRelay(relay)} />
          )}
        </For>
      </div>

      <AddRelayForm onSubmit={addRelay} />
    </div>
  );
}

function LookupSettings() {
  const relays = from(lookupRelays);
  const addLookupRelay = async (url: string) => {
    const current = lookupRelays.getValue();
    if (!current.includes(url)) {
      lookupRelays.next([...current, url]);
    }
  };
  const removeLookupRelay = (url: string) => {
    const current = lookupRelays.getValue();
    lookupRelays.next(current.filter((relay) => relay !== url));
  };

  return (
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold mb-4">Lookup Relays</h1>

      <div class="border rounded bg-white">
        <For each={relays() ?? []}>
          {(relay) => (
            <RelayRow url={relay} onRemove={() => removeLookupRelay(relay)} />
          )}
        </For>
      </div>

      <AddRelayForm onSubmit={addLookupRelay} />
    </div>
  );
}

function SettingsView() {
  const navigate = useNavigate();
  const account = from(accounts.active$);

  return (
    <>
      <div class="flex-grow p-4">
        <LookupSettings />
        {account() ? <MailboxSettings /> : <DefaultRelaysSettings />}
      </div>

      <footer class="bg-blue-500 text-white p-2 flex items-center">
        <button
          onClick={() => navigate(-1)}
          class="p-2 cursor-pointer"
          aria-label="back"
        >
          <BackIcon />
        </button>
      </footer>
    </>
  );
}

export default SettingsView;
