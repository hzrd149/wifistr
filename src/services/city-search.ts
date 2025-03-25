import Fuse from "fuse.js";

const fields = ["name", "names", "lat", "lng", "country"];

export type City = {
  name: string;
  names: string;
  lat: number;
  lng: number;
  country: string;
};

export const citySearch = new Fuse<City>([], {
  keys: ["name", "names"],
});

let loaded = false;
export async function loadCitySearchIndex(): Promise<void> {
  if (loaded) return;

  const txt = await fetch(
    import.meta.env.BASE_URL.replace(/\/$/, "") + "/cities.txt",
  ).then((res) => res.text());

  const lines = txt.split("\n");
  for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length < fields.length) continue;

    const city: City = {
      name: parts[fields.indexOf("name")],
      names:
        parts[fields.indexOf("name")] + "," + parts[fields.indexOf("names")],
      lat: parseFloat(parts[fields.indexOf("lat")]),
      lng: parseFloat(parts[fields.indexOf("lng")]),
      country: parts[fields.indexOf("country")],
    };

    citySearch.add(city);
  }
}
