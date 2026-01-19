import { App } from "@capacitor/app";
import { useNavigate } from "@solidjs/router";
import { onCleanup, onMount } from "solid-js";

/**
 * Hook to handle Android back button presses in Capacitor apps
 *
 * On Android devices, this intercepts the hardware back button and:
 * - Navigates back in browser history if there's history to go back to
 * - Allows the app to exit if user is on the root path ("/")
 *
 * This hook does nothing on web or iOS platforms.
 */
export function useCapacitorBackButton() {
  const navigate = useNavigate();

  onMount(() => {
    const listener = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        navigate(-1);
      } else {
        App.exitApp();
      }
    });

    onCleanup(() => {
      listener.then((l) => l.remove());
    });
  });
}
