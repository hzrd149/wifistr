import { Component, For, from, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";

import { lookupRelays } from "../services/settings";
import { BackIcon, RemoveIcon } from "../components/icons";
import { createRxOneshotReq } from "rx-nostr";
import { rxNostr } from "../services/nostr";
import { eventStore, queryStore } from "../services/stores";
import { TimelineQuery } from "applesauce-core/queries";
import { getTagValue } from "applesauce-core/helpers";
import { map } from "rxjs";

const RelayRow: Component<{ url: string }> = (props) => {
  const remove = () => {
    const current = lookupRelays.getValue();
    lookupRelays.next(current.filter((relay) => relay !== props.url));
  };

  return (
    <div class="flex items-center justify-between p-2 border-b">
      <span>{props.url}</span>
      <button
        onClick={remove}
        class="px-3 py-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
      >
        <RemoveIcon />
      </button>
    </div>
  );
};

const AddRelayForm: Component = () => {
  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const url = formData.get("url")?.toString().trim();

    if (url) {
      const current = lookupRelays.getValue();
      if (!current.includes(url)) {
        lookupRelays.next([...current, url]);
      }
      (e.target as HTMLFormElement).reset();
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
      />
      <datalist id="relays">
        <For each={relays() ?? []}>
          {(url) => <option value={url}>{url}</option>}
        </For>
      </datalist>
      <button
        type="submit"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Relay
      </button>
    </form>
  );
};

const SettingsView: Component = () => {
  const navigate = useNavigate();

  const relays = from(lookupRelays);

  return (
    <div class="h-dvh bg-gray-100 flex flex-col">
      <div class="flex-grow p-4">
        <div class="max-w-md mx-auto">
          <h1 class="text-2xl font-bold mb-4">Lookup Relays</h1>

          <div class="border rounded bg-white">
            <For each={relays() ?? []}>
              {(relay) => <RelayRow url={relay} />}
            </For>
          </div>

          <AddRelayForm />
        </div>
      </div>

      <footer class="bg-blue-500 text-white p-2 flex items-center">
        <button onClick={() => navigate(-1)} class="p-2 cursor-pointer">
          <BackIcon />
        </button>
      </footer>
    </div>
  );
};

export default SettingsView;
