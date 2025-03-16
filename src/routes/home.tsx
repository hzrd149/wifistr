import { Location, RouteSectionProps } from "@solidjs/router";
import Map from "../components/map";
import { SearchIcon } from "../components/icons";
import { LatLng } from "leaflet";

function HomeView(props: RouteSectionProps) {
  const location: Location<{ center?: LatLng }> = props.location;

  return (
    <>
      <div class="min-h-screen bg-gray-100 flex flex-col">
        <header class="bg-blue-500 text-white py-4 flex justify-between items-center">
          <h1 class="text-left text-xl font-bold mx-4">Wifistr</h1>
          <a href="/search" class="mr-4">
            <SearchIcon />
          </a>
        </header>
        <main class="flex-col flex-grow flex">
          <Map
            class="grow"
            markers={[]}
            center={location.state?.center}
            cache="home"
          />
        </main>
        <footer class="bg-blue-500 text-white py-2 text-center">
          {/* Add footer content here if needed */}
        </footer>
      </div>
    </>
  );
}

export default HomeView;
