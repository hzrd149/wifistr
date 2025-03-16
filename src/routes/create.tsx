import { createSignal } from "solid-js";
import { Location, RouteSectionProps, useNavigate } from "@solidjs/router";
import { BackIcon, QrCodeIcon } from "../components/icons";
import { WifiCode } from "../helpers/qr-code";
import LocationPicker from "../components/location-picker";

function CreateWifiView(props: RouteSectionProps) {
  const location: Location<{ wifi?: WifiCode }> = props.location;

  const [ssid, setSsid] = createSignal(location.state?.wifi?.ssid ?? "");
  const [securityType, setSecurityType] = createSignal(
    location.state?.wifi?.securityType ?? "WPA",
  );
  const [password, setPassword] = createSignal(
    location.state?.wifi?.password ?? "",
  );
  const [hidden, setHidden] = createSignal(
    location.state?.wifi?.hidden ?? false,
  );
  const [hasCaptivePortal, setHasCaptivePortal] = createSignal(false);

  const navigate = useNavigate();

  const [loading, setLoading] = createSignal(false);
  const handleSave = async (event: SubmitEvent) => {
    event.preventDefault();

    setLoading(true);
    const wifiDetails = {
      ssid: ssid(),
      securityType: securityType(),
      password: password(),
      hasCaptivePortal: hasCaptivePortal(),
    };

    try {
      console.log("Saving WiFi Details:", wifiDetails);
      // Simulate async operation, e.g., saving data to a server
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("WiFi Details saved");
    } catch (error) {
      console.error("Error saving WiFi Details", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main class="flex-col flex-grow flex overflow-auto">
        <LocationPicker onPick={() => {}} />
        <form
          id="wifi-network"
          class="space-y-4 p-4 border-t"
          on:submit={handleSave}
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
              disabled={loading()}
              required
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
              disabled={loading()}
              required
            >
              <option value="WPA">WPA</option>
              <option value="WEP">WEP</option>
              <option value="WPA2">WPA2</option>
              <option value="WPA3">WPA3</option>
              <option value="none">None</option>
            </select>
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
              disabled={loading()}
              required={securityType() !== "none"}
            />
          </div>
          <div class="flex items-center">
            <input
              id="hidden"
              type="checkbox"
              class="mr-2"
              checked={hidden()}
              onChange={(e) => setHidden(e.currentTarget.checked)}
              disabled={loading()}
            />
            <label for="hidden" class="font-semibold">
              Hidden network
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="portal"
              type="checkbox"
              class="mr-2"
              checked={hasCaptivePortal()}
              onChange={(e) => setHasCaptivePortal(e.currentTarget.checked)}
              disabled={loading()}
            />
            <label for="portal" class="font-semibold">
              Captive Portal
            </label>
          </div>
        </form>
      </main>

      <footer class="bg-blue-500 text-white p-2 flex items-center">
        <button class="p-2 cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
        <div class="flex-grow"></div>
        <a class="rounded text-white p-2 cursor-pointer" href="/scan">
          <QrCodeIcon />
        </a>
        <button
          type="submit"
          form="wifi-network"
          class="bg-blue-500 text-white rounded py-2 px-4 cursor-pointer font-bold text-md"
          disabled={loading()}
        >
          {loading() ? "Saving..." : "Save"}
        </button>
      </footer>
    </>
  );
}

export default CreateWifiView;
