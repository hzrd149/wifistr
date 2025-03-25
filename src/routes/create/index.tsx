import { createSignal } from "solid-js";
import { A, Location, RouteSectionProps, useNavigate } from "@solidjs/router";
import { LatLng } from "leaflet";

import { BackIcon, QrCodeIcon } from "../../components/icons";
import { WifiCode } from "../../helpers/qr-code";
import LocationPicker from "./components/location-picker";
import { factory } from "../../services/actions";
import { WifiBlueprint } from "../../blueprints/wifi";
import { publish } from "../../services/nostr";
import { toastOperation } from "../../helpers/toast";

function CreateWifiView(props: RouteSectionProps) {
  const location: Location<{
    wifi?: WifiCode;
    center?: LatLng;
    zoom?: number;
  }> = props.location;

  const [wifiLocation, setWifiLatlng] = createSignal<LatLng | undefined>();
  const [ssid, setSsid] = createSignal(location.state?.wifi?.ssid ?? "");
  const [securityType, setSecurityType] = createSignal(
    location.state?.wifi?.securityType ?? "WPA2",
  );
  const [password, setPassword] = createSignal(
    location.state?.wifi?.password ?? "",
  );
  const [hidden, setHidden] = createSignal(
    location.state?.wifi?.hidden ?? false,
  );
  const [captive, setCaptive] = createSignal(false);

  const navigate = useNavigate();

  const save = toastOperation(
    async (event: SubmitEvent) => {
      event.preventDefault();

      const wifiDetails = {
        ssid: ssid(),
        securityType: securityType(),
        password: password(),
        captive: captive(),
        hidden: hidden(),
      };
      const location = wifiLocation();
      if (!location) throw new Error("Location is missing");

      const draft = await factory.create(WifiBlueprint, wifiDetails, location);
      const signed = await factory.sign(draft);

      await publish(signed);
      navigate("/");
    },
    {
      loading: "Saving WiFi...",
      success: "WiFi created",
      error: (err) => `Error creating WiFi: ${err.message}`,
    },
  );

  return (
    <>
      <main class="flex-col flex-grow flex overflow-auto">
        <LocationPicker
          onPick={setWifiLatlng}
          center={location.state?.center}
          zoom={location.state?.zoom}
        />
        <form
          id="wifi-network"
          class="space-y-2 p-4 border-t"
          on:submit={save.run}
        >
          <div class="flex flex-col">
            <label for="ssid" class="font-semibold">
              SSID
            </label>
            <input
              id="ssid"
              type="text"
              class="border p-2 rounded"
              value={ssid()}
              onInput={(e) => setSsid(e.currentTarget.value)}
              disabled={save.loading()}
              required
            />
          </div>
          <div class="flex flex-col">
            <label for="password" class="font-semibold">
              Password
            </label>
            <input
              id="password"
              type="text"
              class="border p-2 rounded"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              disabled={save.loading()}
              required={securityType() !== "nopass"}
            />
          </div>
          <div class="flex flex-col">
            <label for="security" class="font-semibold">
              Security Type
            </label>
            <select
              id="security"
              class="border p-2 rounded"
              value={securityType()}
              onChange={(e) => setSecurityType(e.currentTarget.value)}
              disabled={save.loading()}
              required
            >
              <option value="WPA">WPA</option>
              <option value="WEP">WEP</option>
              <option value="WPA2">WPA2</option>
              <option value="WPA3">WPA3</option>
              <option value="nopass">None</option>
            </select>
          </div>
          <div class="flex items-center">
            <input
              id="hidden"
              type="checkbox"
              class="mr-2"
              checked={hidden()}
              onChange={(e) => setHidden(e.currentTarget.checked)}
              disabled={save.loading()}
            />
            <label for="hidden" class="font-semibold">
              Hidden network
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="captive"
              type="checkbox"
              class="mr-2"
              checked={captive()}
              onChange={(e) => setCaptive(e.currentTarget.checked)}
              disabled={save.loading()}
            />
            <label for="captive" class="font-semibold">
              Captive portal
            </label>
          </div>
        </form>
      </main>

      <footer class="bg-blue-500 text-white p-2 flex items-center">
        <button
          class="p-2 cursor-pointer"
          onClick={() => navigate(-1)}
          aria-label="back"
        >
          <BackIcon />
        </button>
        <div class="flex-grow"></div>
        <A
          class="rounded text-white p-2 cursor-pointer"
          href="/scan"
          aria-label="scan qr code"
        >
          <QrCodeIcon />
        </A>
        <button
          type="submit"
          form="wifi-network"
          class="bg-blue-500 text-white rounded py-2 px-4 cursor-pointer font-bold text-md"
          disabled={save.loading()}
          aria-label="save network"
        >
          {save.loading() ? "Saving..." : "Save"}
        </button>
      </footer>
    </>
  );
}

export default CreateWifiView;
