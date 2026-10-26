#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { icons } from "../mizu/src/icons.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mizuDir = path.resolve(__dirname, "../mizu");
const outDir = __dirname;
const iconsDir = path.join(outDir, "icons");
const themesDir = path.join(outDir, "icon_themes");

fs.mkdirSync(iconsDir, { recursive: true });
fs.mkdirSync(themesDir, { recursive: true });

function extractIcons(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const matches = content.match(/<g.+?<\/g>/gs) || [];
  const result = {};
  for (const group of matches) {
    const m = /<g id="([^"]+)".*?>(.+)<\/g>/s.exec(group);
    if (!m) continue;
    const [, id, svg] = m;
    if (id.startsWith("_")) continue;
    const name = id.replace(/_(.)/g, (_, v) => v.toUpperCase());
    result[name] = svg.trim();
  }
  return result;
}

const brandIcons = extractIcons(path.join(mizuDir, "assets/icons-brand.svg"));
const generalIcons = extractIcons(path.join(mizuDir, "assets/icons-general.svg"));
const allIcons = { ...brandIcons, ...generalIcons };

console.log(`Extracted ${Object.keys(allIcons).length} icons from SVG assets.`);

// Write all SVGs
const wrapSVG = (svg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${svg}</svg>\n`;

let writtenIcons = 0;
for (const [name, svg] of Object.entries(allIcons)) {
  fs.writeFileSync(path.join(iconsDir, `${name}.svg`), wrapSVG(svg));
  writtenIcons++;
}
console.log(`Wrote ${writtenIcons} SVG files into ${iconsDir}`);

function variants(nodes) {
  let groups = [nodes];
  nodes.match(/\(.+?\)/g)?.forEach((group) => {
    groups = group
      .slice(1, -1)
      .split("|")
      .flatMap((alt) => groups.map((node) => node.replace(group, alt)));
  });

  return groups.flatMap((group) => {
    if (group.includes("?")) {
      let quantifiers = [group];
      for (const quantifier of group.match(/.\?/g)) {
        quantifiers = quantifiers.flatMap((node) => [
          node.replace(quantifier, ""),
          node.replace(quantifier[1], ""),
        ]);
      }
      return quantifiers;
    }
    return group;
  });
}

const file_icons = {
  default: { path: "./icons/file.svg" },
  file: { path: "./icons/file.svg" },
};
const file_suffixes = {};
const file_stems = {};
const named_directory_icons = {};

for (const [name, associations] of Object.entries(icons)) {
  // Register file icon if icon exists
  if (name in allIcons) {
    file_icons[name] = { path: `./icons/${name}.svg` };
  }

  for (const assoc of associations) {
    if (assoc.startsWith("/")) {
      const nodePattern = assoc.slice(1);
      const folderList = variants(nodePattern);
      const collapsedPath = `./icons/${name}Folder.svg`;
      const expandedPath = `./icons/${name}FolderX.svg`;

      for (const folder of folderList) {
        named_directory_icons[folder] = {
          collapsed: collapsedPath,
          expanded: expandedPath,
        };
      }
    } else if (assoc.startsWith("*.")) {
      const nodePattern = assoc.slice(2);
      const extList = variants(nodePattern);
      for (const ext of extList) {
        file_suffixes[ext] = name;
        file_suffixes[ext.toUpperCase()] = name;
      }
    } else {
      const stemList = variants(assoc);
      for (const stem of stemList) {
        file_stems[stem] = name;
        file_stems[stem.toLowerCase()] = name;
        file_stems[stem.toUpperCase()] = name;

        // Titlecase variant
        if (!stem.startsWith(".")) {
          const titleCase = stem.charAt(0).toUpperCase() + stem.slice(1).toLowerCase();
          file_stems[titleCase] = name;
        }
      }
    }
  }
}

const themeContentDark = {
  name: "Mizu",
  appearance: "dark",
  directory_icons: {
    collapsed: "./icons/folder.svg",
    expanded: "./icons/folderX.svg",
  },
  named_directory_icons,
  file_icons,
  file_suffixes,
  file_stems,
};

const themeContentLight = {
  name: "Mizu Light",
  appearance: "light",
  directory_icons: {
    collapsed: "./icons/folder.svg",
    expanded: "./icons/folderX.svg",
  },
  named_directory_icons,
  file_icons,
  file_suffixes,
  file_stems,
};

const iconThemeJson = {
  $schema: "https://zed.dev/schema/icon_themes/v0.3.0.json",
  name: "Mizu",
  author: "m39u",
  themes: [themeContentDark, themeContentLight],
};

const themeJsonPath = path.join(themesDir, "mizu.json");
fs.writeFileSync(themeJsonPath, JSON.stringify(iconThemeJson, null, 2));
console.log(`Generated Zed icon theme at ${themeJsonPath}`);

// Write extension.toml
const extensionToml = `id = "mizu"
name = "Mizu"
version = "2.10.1"
schema_version = 1
authors = ["m39u <https://github.com/m39u>", "sniperravan"]
description = "700+ icons for many languages and frameworks, converted for Zed."
repository = "https://github.com/m39u/mizu"
`;

fs.writeFileSync(path.join(outDir, "extension.toml"), extensionToml);
console.log("Wrote extension.toml");
