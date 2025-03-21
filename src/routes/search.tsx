import { createResource, createSignal, For, Match, Switch } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { matchSorter } from "match-sorter";
import { debounce } from "@solid-primitives/scheduled";

import { BackIcon } from "../components/icons";
import { City, getSearchIndex } from "../services/search";

function SearchView() {
  const navigate = useNavigate();

  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<City[] | null | undefined>(
    undefined,
  );

  const [cities] = createResource(getSearchIndex);

  const search = debounce(() => {
    cities();
    if (cities.state !== "ready") return;

    if (query()) {
      const sorted = matchSorter(cities(), query(), {
        keys: ["names"],
      });
      if (sorted.length > 50) sorted.length = 50;
      setResults(sorted);
    } else {
      setResults([]);
    }
  }, 500);

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setResults(null);
    setQuery(target.value);
    search();
  };

  return (
    <>
      <main class="overflow-y-auto p-2 flex flex-grow flex-col-reverse">
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
                <div class="flex justify-center items-center h-32">
                  <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
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
              <a
                href="#"
                class="text-blue-500 hover:underline float-right"
                on:click={() =>
                  navigate("/", {
                    state: { center: { lat: city.lat, lng: city.lng } },
                  })
                }
              >
                View
              </a>
              <div class="font-bold text-lg">
                {city.name} ({city.country})
              </div>
              <div class="text-sm text-gray-600 mt-2">
                Lat: {city.lat}, Lng: {city.lng}
              </div>
            </li>
          )}
        </For>
      </main>

      <footer class="flex items-center gap-2 p-2 ">
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
          placeholder="Search for a city..."
          value={query()}
          on:input={handleInputChange}
          autofocus
        />
      </footer>
    </>
  );
}

export default SearchView;
