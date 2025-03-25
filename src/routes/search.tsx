import {
  createEffect,
  createSignal,
  For,
  Match,
  onMount,
  Switch,
} from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { debounce } from "@solid-primitives/scheduled";

import { BackIcon } from "../components/icons";
import { City, citySearch, loadCitySearchIndex } from "../services/city-search";
import { cacheRequest } from "../services/cache";
import { WIFI_NETWORK_KIND } from "../const";
import { eventStore } from "../services/stores";
import { wifiSearch, WifiSearchItem } from "../services/wifi-search";
import { naddrEncode } from "nostr-tools/nip19";
import { getAddressPointerForEvent } from "applesauce-core/helpers";

function LoadingSpinner() {
  return (
    <div class="flex justify-center items-center h-32">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

function CityResults(props: { query: string }) {
  const [results, setResults] = createSignal<City[] | null | undefined>(
    undefined,
  );

  const search = debounce(() => {
    if (props.query) {
      const results = citySearch.search(props.query, { limit: 20 });
      setResults(results.map((r) => r.item));
    } else {
      setResults([]);
    }
  }, 500);

  onMount(() => {
    loadCitySearchIndex();
  });

  createEffect(() => {
    if (props.query.length >= 2) {
      search();
      setResults(null);
    } else {
      setResults(undefined);
    }
  });

  return (
    <For
      each={results()}
      fallback={
        <Switch
          fallback={
            <div class="flex justify-center items-center h-32">
              <p class="text-lg text-gray-500">Search for city</p>
            </div>
          }
        >
          <Match when={results() === null}>
            <LoadingSpinner />
          </Match>
          <Match when={results()?.length === 0}>
            <div class="flex justify-center items-center h-32">
              <p class="text-lg text-gray-500">No cities found</p>
            </div>
          </Match>
        </Switch>
      }
    >
      {(city) => (
        <li class="bg-white shadow-md rounded-lg p-4 mb-2">
          <A
            href="/"
            class="text-blue-500 hover:underline float-right"
            state={{ center: { lat: city.lat, lng: city.lng } }}
          >
            View
          </A>
          <div class="font-bold text-lg">
            {city.name} ({city.country})
          </div>
          <div class="text-sm text-gray-600 mt-2">
            Lat: {city.lat}, Lng: {city.lng}
          </div>
        </li>
      )}
    </For>
  );
}

// keep this out of the component so its global
let loadedFromCache = false;

function WifiResults(props: { query: string }) {
  const [results, setResults] = createSignal<
    WifiSearchItem[] | null | undefined
  >(undefined);

  const search = debounce(() => {
    if (props.query) {
      const results = wifiSearch.search(props.query, { limit: 20 });
      setResults(results.map((r) => r.item));
    } else {
      setResults([]);
    }
  }, 500);

  createEffect(() => {
    if (props.query.length >= 2) {
      search();
      setResults(null);
    } else {
      setResults(undefined);
    }
  });

  return (
    <For
      each={results()}
      fallback={
        <Switch
          fallback={
            <div class="flex justify-center items-center h-32">
              <p class="text-lg text-gray-500">Search for WiFi networks</p>
            </div>
          }
        >
          <Match when={results() === null}>
            <LoadingSpinner />
          </Match>
          <Match when={results()?.length === 0}>
            <div class="flex justify-center items-center h-32">
              <p class="text-lg text-gray-500">No networks found</p>
            </div>
          </Match>
        </Switch>
      }
    >
      {(network) => (
        <li class="bg-white shadow-md rounded-lg p-4 mb-2">
          <A
            href={`/wifi/${naddrEncode(getAddressPointerForEvent(network.event))}`}
            class="text-blue-500 hover:underline float-right"
          >
            View
          </A>
          <div class="font-bold text-lg">{network.ssid}</div>
          <div class="text-sm text-gray-600 mt-2">{network.about}</div>
        </li>
      )}
    </For>
  );
}

function SearchView() {
  const navigate = useNavigate();

  const [query, setQuery] = createSignal("");
  const [searchMode, setSearchMode] = createSignal<"cities" | "networks">(
    "cities",
  );

  // load all cached networks when mode is switched
  createEffect(() => {
    if (searchMode() === "networks" && !loadedFromCache) {
      console.log("Loading all wifi networks from cache");

      loadedFromCache = true;
      cacheRequest([{ kinds: [WIFI_NETWORK_KIND] }]).subscribe((event) =>
        eventStore.add(event),
      );
    }
  });

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setQuery(target.value);
  };

  return (
    <>
      <main class="overflow-y-auto p-2 flex flex-grow flex-col-reverse">
        {searchMode() === "cities" ? (
          <CityResults query={query()} />
        ) : (
          <WifiResults query={query()} />
        )}
      </main>

      <footer class="flex flex-col gap-2 p-2">
        <div class="flex gap-2 ">
          <button
            class={`px-3 py-1 rounded-lg font-medium transition-colors ${
              searchMode() === "cities"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSearchMode("cities")}
          >
            Cities
          </button>
          <button
            class={`px-3 py-1 rounded-lg font-medium transition-colors ${
              searchMode() === "networks"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSearchMode("networks")}
          >
            Networks
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            class="bg-blue-500 text-white rounded p-2 cursor-pointer"
            aria-label="back"
          >
            <BackIcon />
          </button>
          <input
            type="text"
            class="flex-grow border border-gray-300 rounded py-2 px-3"
            placeholder={`Search for a ${searchMode()}...`}
            value={query()}
            on:input={handleInputChange}
            autofocus
          />
        </div>
      </footer>
    </>
  );
}

export default SearchView;
