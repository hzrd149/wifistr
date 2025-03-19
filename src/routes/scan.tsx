import { onCleanup, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import QrScanner from "qr-scanner";

import { BackIcon } from "../components/icons";
import { parseWifiQrCode } from "../helpers/qr-code";

function ScanQrCodeView() {
  const navigate = useNavigate();
  let videoRef: HTMLVideoElement | undefined;
  let qrScanner: QrScanner | undefined;

  const startQrScanner = async () => {
    if (!videoRef) return;

    try {
      qrScanner = new QrScanner(
        videoRef,
        (result) => {
          const wifi = parseWifiQrCode(result.data);
          if (wifi) {
            qrScanner!.stop();
            qrScanner!.destroy();
            navigate("/create", { state: { wifi }, replace: true });
          }
        },
        {
          returnDetailedScanResult: true,
        },
      );

      await qrScanner.start();
    } catch (error) {
      console.error("Error initializing the QR scanner: ", error);
    }
  };

  onMount(() => {
    startQrScanner();
  });

  onCleanup(() => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
    }
  });

  return (
    <div class="h-dvh overflow-hidden flex flex-col">
      <div class="flex-grow">
        <video
          ref={videoRef}
          class="w-full h-full object-cover"
          autoplay
          playsinline
        ></video>
      </div>
      <footer class="bg-blue-500 text-white p-2 flex items-center">
        <button class="p-2 cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
      </footer>
    </div>
  );
}

export default ScanQrCodeView;
