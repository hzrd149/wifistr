import fs from "fs";
import cities from "cities-with-1000";

console.log("Building cities.txt");

var lines = fs.readFileSync(cities.file, "utf8").split("\n");

const write = fs.createWriteStream("public/cities.txt");

const keepFields = ["name", "alternativeNames", "lat", "lon", "country"].map(
  (name) => cities.fields.indexOf(name),
);
for (const line of lines) {
  let parts = line.split("\t");
  let pop = parseInt(parts[cities.fields.indexOf("population")]);

  if (pop < 10_000) continue;

  let modified = parts.filter((_, i) => keepFields.includes(i)).join("\t");
  write.write(modified + "\n");
}

write.end();
