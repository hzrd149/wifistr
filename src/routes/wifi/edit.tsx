import { Navigate, RouteSectionProps, useNavigate } from "@solidjs/router";
import { getTagValue } from "applesauce-core/helpers";
import { setContent } from "applesauce-factory/operations/content";
import { nip19, NostrEvent } from "nostr-tools";
import { createSignal, from } from "solid-js";

import { BackIcon } from "../../components/icons";
import { WIFI_SECURITY_TYPES } from "../../const";
import { asyncAction } from "../../helpers/async-action";
import { includeWifiTags } from "../../operations/event/wifi";
import { factory } from "../../services/actions";
import { publish } from "../../services/pool";
import { eventStore } from "../../services/stores";

function WifiEditForm(props: { wifi: NostrEvent }) {
  const navigate = useNavigate();

  const [name, setName] = createSignal(getTagValue(props.wifi, "name") || "");
  const [ssid, setSsid] = createSignal(getTagValue(props.wifi, "ssid") || "");
  const [password, setPassword] = createSignal(
    getTagValue(props.wifi, "password") || "",
  );
  const [security, setSecurity] = createSignal(
    getTagValue(props.wifi, "security") ?? "nopass",
  );
  const [hidden, setHidden] = createSignal(
    getTagValue(props.wifi, "h") === "true",
  );
  const [captive, setCaptive] = createSignal(
    getTagValue(props.wifi, "c") === "true",
  );
  const [about, setAbout] = createSignal(props.wifi.content || "");

  const update = asyncAction(
    async () => {
      const draft = await factory.modify(
        props.wifi,
        setContent(about()),
        includeWifiTags({
          name: name(),
          ssid: ssid(),
          password: password(),
          hidden: hidden(),
          captive: captive(),
          security: security(),
        }),
      );

      const signed = await factory.sign(draft);
      await publish(signed);
      navigate(-1);
    },
    { success: "Updated" },
  );

  return (
    <>
      <div>
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          class="border p-2 rounded w-full"
          disabled={update.loading()}
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">SSID</label>
        <input
          type="text"
          value={ssid()}
          onInput={(e) => setSsid(e.currentTarget.value)}
          class="border p-2 rounded w-full"
          disabled={update.loading()}
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="text"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          class="border p-2 rounded w-full"
          disabled={update.loading()}
          required={security() !== "nopass"}
        />
      </div>

      <div class="flex flex-col">
        <label for="security" class="font-semibold">
          Security Type
        </label>
        <select
          id="security"
          class="border p-2 rounded"
          value={security()}
          onChange={(e) => setSecurity(e.currentTarget.value)}
          disabled={update.loading()}
          required
        >
          {Object.entries(WIFI_SECURITY_TYPES).map(([key, value]) => (
            <option value={key}>{value}</option>
          ))}
        </select>
      </div>

      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hidden()}
            onChange={(e) => setHidden(e.currentTarget.checked)}
          />
          <span class="text-sm text-gray-700">Hidden Network</span>
        </label>

        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={captive()}
            onChange={(e) => setCaptive(e.currentTarget.checked)}
          />
          <span class="text-sm text-gray-700">Captive Portal</span>
        </label>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">About</label>
        <textarea
          value={about()}
          onInput={(e) => setAbout(e.currentTarget.value)}
          rows={4}
          class="border p-2 rounded w-full"
          placeholder="Add a description of this wifi network..."
        />
      </div>

      <button
        onClick={update.run}
        disabled={update.loading()}
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
      >
        {update.loading() ? "Updating..." : "Update Wifi Network"}
      </button>
    </>
  );
}

export default function WifiEditView(props: RouteSectionProps) {
  const { naddr } = props.params;
  if (!naddr) return <Navigate href="/" />;

  const decoded = nip19.decode(naddr);
  if (decoded.type !== "naddr") return <Navigate href="/" />;

  const pointer = decoded.data;

  const navigate = useNavigate();
  const wifi = from(eventStore.replaceable(pointer));

  return (
    <>
      <main class="flex-col flex-grow flex overflow-auto  gap-2 p-4">
        {wifi() ? <WifiEditForm wifi={wifi()!} /> : <div>Loading...</div>}
      </main>

      <footer class="bg-blue-500 text-white p-2 pb-safe-or-2 flex items-center gap-2">
        <button class="p-2 cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
      </footer>
    </>
  );
}
