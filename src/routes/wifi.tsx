import { RouteSectionProps, useNavigate } from "@solidjs/router";
import { BackIcon } from "../components/icons";

export default function WifiView(_props: RouteSectionProps) {
  const navigate = useNavigate();

  return (
    <>
      <main class="flex-col flex-grow flex overflow-auto"></main>

      <footer class="bg-blue-500 text-white p-2 flex items-center">
        <button class="p-2 cursor-pointer" onClick={() => navigate(-1)}>
          <BackIcon />
        </button>
      </footer>
    </>
  );
}
