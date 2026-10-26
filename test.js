#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Running Zed Mizu Icon Theme Validation Suite...\n");

// 1. Validate extension.toml
const tomlPath = path.join(__dirname, "extension.toml");
assert(fs.existsSync(tomlPath), "extension.toml must exist");
const tomlContent = fs.readFileSync(tomlPath, "utf8");
assert(tomlContent.includes('id = "mizu-icon-theme"'), "extension.toml must have id = 'mizu-icon-theme'");
assert(tomlContent.includes("schema_version = 1"), "schema_version must be 1");
console.log("✓ extension.toml verified.");

// 2. Validate icon_themes/mizu.json
const themeJsonPath = path.join(__dirname, "icon_themes/mizu.json");
assert(fs.existsSync(themeJsonPath), "icon_themes/mizu.json must exist");
const themeData = JSON.parse(fs.readFileSync(themeJsonPath, "utf8"));

assert.strictEqual(typeof themeData.author, "string", "Theme must have author string");
assert.strictEqual(typeof themeData.name, "string", "Theme must have name string");
assert(Array.isArray(themeData.themes), "Theme must have themes array");
assert(themeData.themes.length > 0, "Theme array must not be empty");
console.log(`✓ icon_themes/mizu.json parsed with ${themeData.themes.length} themes.`);

// 3. Schema & Reference Integrity Verification
const iconsDir = path.join(__dirname, "icons");

for (const theme of themeData.themes) {
  assert(theme.name, "Theme must have a name");
  assert(["dark", "light"].includes(theme.appearance), "Appearance must be dark or light");

  // Check directory icons
  assert(theme.directory_icons?.collapsed, "Must have directory_icons.collapsed");
  assert(theme.directory_icons?.expanded, "Must have directory_icons.expanded");

  const collapsedFile = path.resolve(__dirname, theme.directory_icons.collapsed);
  const expandedFile = path.resolve(__dirname, theme.directory_icons.expanded);
  assert(fs.existsSync(collapsedFile), `Collapsed directory icon must exist: ${collapsedFile}`);
  assert(fs.existsSync(expandedFile), `Expanded directory icon must exist: ${expandedFile}`);

  // Check file icons
  assert(theme.file_icons, "Must have file_icons");
  assert(theme.file_icons.default, "Must have default file icon");
  const defaultFile = path.resolve(__dirname, theme.file_icons.default.path);
  assert(fs.existsSync(defaultFile), `Default file icon must exist: ${defaultFile}`);

  let missingIconPaths = 0;
  for (const [id, def] of Object.entries(theme.file_icons)) {
    assert(def.path, `file_icon '${id}' must have path`);
    const p = path.resolve(__dirname, def.path);
    if (!fs.existsSync(p)) {
      missingIconPaths++;
    }
  }
  assert.strictEqual(missingIconPaths, 0, `All file_icon paths must exist. Missing: ${missingIconPaths}`);

  // Check named directory icons
  let missingNamedDirIcons = 0;
  for (const [dirName, def] of Object.entries(theme.named_directory_icons)) {
    const col = path.resolve(__dirname, def.collapsed);
    const exp = path.resolve(__dirname, def.expanded);
    if (!fs.existsSync(col) || !fs.existsSync(exp)) {
      missingNamedDirIcons++;
    }
  }
  assert.strictEqual(missingNamedDirIcons, 0, `All named_directory_icons paths must exist. Missing: ${missingNamedDirIcons}`);

  // Check file_suffixes reference valid file_icons
  let unmappedSuffixes = 0;
  for (const [suffix, iconId] of Object.entries(theme.file_suffixes)) {
    if (!theme.file_icons[iconId]) {
      unmappedSuffixes++;
    }
  }
  assert.strictEqual(unmappedSuffixes, 0, `All file_suffixes must map to known file_icons. Missing: ${unmappedSuffixes}`);

  // Check file_stems reference valid file_icons
  let unmappedStems = 0;
  for (const [stem, iconId] of Object.entries(theme.file_stems)) {
    if (!theme.file_icons[iconId]) {
      unmappedStems++;
    }
  }
  assert.strictEqual(unmappedStems, 0, `All file_stems must map to known file_icons. Missing: ${unmappedStems}`);

  console.log(`✓ Theme '${theme.name}' (${theme.appearance}):`);
  console.log(`   - Named directory associations: ${Object.keys(theme.named_directory_icons).length}`);
  console.log(`   - File icon definitions: ${Object.keys(theme.file_icons).length}`);
  console.log(`   - File suffixes: ${Object.keys(theme.file_suffixes).length}`);
  console.log(`   - File stems: ${Object.keys(theme.file_stems).length}`);
}

console.log("\nAll self-check assertions passed successfully! 🚀");
