import { createSignal } from "solid-js";
import toast, { Renderable, ValueOrFunction } from "solid-toast";

export function toastOperation<Args extends Array<any>, T extends unknown>(
  operation: (...args: Args) => Promise<T>,
  options: {
    loading: Renderable;
    success: ValueOrFunction<Renderable, T>;
    error: ValueOrFunction<Renderable, any>;
  },
) {
  const [loading, setLoading] = createSignal(false);
  const run = async (...args: Args) => {
    setLoading(true);
    const p = operation(...args);
    p.finally(() => {
      setLoading(false);
    });

    return toast.promise(p, options);
  };

  return {
    run,
    loading,
  };
}
