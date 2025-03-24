import { NostrEvent } from "nostr-tools";
import { getTagValue } from "applesauce-core/helpers";
import QRCode from "qrcode-svg";

import { CloseIcon } from "../../../components/icons";
import { createWifiQrCode } from "../../../helpers/qr-code";

export default function WifiQrModal(props: {
  wifi: NostrEvent;
  onClose: () => void;
}) {
  return (
    <div
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={props.onClose}
    >
      <div
        class="bg-white p-6 rounded-lg max-w-sm w-full md:max-w-md mx-4 md:mx-0 h-auto md:h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Scan to Connect</h2>
          <button
            class="text-gray-500 hover:text-gray-800 cursor-pointer"
            onClick={props.onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <div class="flex justify-center mb-4">
          <div
            innerHTML={new QRCode({
              content: createWifiQrCode({
                ssid: getTagValue(props.wifi, "ssid"),
                password: getTagValue(props.wifi, "password"),
                hidden: getTagValue(props.wifi, "h") === "true",
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
          {getTagValue(props.wifi, "ssid")}"
        </p>
      </div>
    </div>
  );
}
