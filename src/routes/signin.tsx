import { A, useNavigate } from "@solidjs/router";
import { createMemo, createSignal } from "solid-js";

import { BackIcon, QrCodeIcon, SettingsIcon } from "../components/icons";

function SigninView() {
  const navigate = useNavigate();
  const [nsec, setNsec] = createSignal("");

  const hasExtension = createMemo(() => Reflect.has(window, "nostr"));

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    // Handle signin logic here
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        class="p-4 flex-grow flex flex-col justify-center items-center gap-2"
      >
        <div class="flex gap-2 w-full">
          <input
            type="password"
            value={nsec()}
            onInput={(e) => setNsec(e.currentTarget.value)}
            placeholder="Enter your nsec..."
            class="flex-1 p-2 border rounded"
          />
          <button
            type="button"
            class="p-2 bg-blue-500 text-white rounded cursor-pointer"
            disabled
          >
            <QrCodeIcon />
          </button>
        </div>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer w-full"
        >
          Sign In
        </button>
        {hasExtension() && (
          <button
            type="button"
            class="px-4 py-2 border rounded hover:bg-gray-100 cursor-pointer"
          >
            Use Extension
          </button>
        )}
      </form>

      <footer class="flex justify-between p-2 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          class="p-2 cursor-pointer"
          aria-label="back"
        >
          <BackIcon />
        </button>
        <A href="/settings" class="p-2" aria-label="settings">
          <SettingsIcon />
        </A>
      </footer>
    </>
  );
}

export default SigninView;
