import { createSignal } from "solid-js";
import { CheckIcon, CopyToClipboardIcon } from "./icons";

export default function CopyButton(props: { text: string }) {
  const [copied, setCopied] = createSignal(false);
  const copy = () => {
    navigator.clipboard.writeText(props.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button class="p-2 cursor-pointer" onClick={copy}>
      {copied() ? (
        <CheckIcon class="size-5" />
      ) : (
        <CopyToClipboardIcon class="size-5" />
      )}
    </button>
  );
}
