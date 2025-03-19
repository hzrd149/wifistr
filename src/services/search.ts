const fields = ["name", "names", "lat", "lng", "country"];

export type City = {
  name: string;
  names: string;
  lat: number;
  lng: number;
  country: string;
};
let cache: City[] | undefined = undefined;

export async function getSearchIndex(): Promise<City[]> {
  if (cache) return cache;

  const txt = await fetch("/cities.txt").then((res) => res.text());

  const cities: City[] = [];
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

    cities.push(city);
  }

  cache = cities;
  return cities;
}
