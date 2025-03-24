import { createSignal } from "solid-js";
import toast from "solid-toast";

export function asyncAction<Args extends Array<any>, T extends unknown>(
  operation: (...args: Args) => Promise<T>,
  toasts?: { success?: string; error?: string },
) {
  const [loading, setLoading] = createSignal(false);
  const run = async (...args: Args) => {
    setLoading(true);
    const p = operation(...args);

    p.then(() => toasts?.success && toast.success(toasts?.success))
      .catch((e) => toast.error(toasts?.error ?? e.message))
      .finally(() => {
        setLoading(false);
      });

    return p;
  };

  return {
    run,
    loading,
  };
}
