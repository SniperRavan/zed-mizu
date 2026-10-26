# Mizu Icon Theme for Zed

700+ icons for many languages and frameworks, converted from the VS Code [mizu](https://github.com/m39u/mizu) extension for [Zed](https://zed.dev).

## Features

- **700+ language, framework, and tool icons**: Full coverage matching VS Code Mizu.
- **1,450+ Named Folder Icons**: Collapsed and expanded variants for components, routes, models, tests, docker, git, rust crates, etc.
- **1,890+ File Suffix Associations**: Supports compound extensions like `.blade.php`, `.d.ts`, `.spec.tsx`, `.config.js`, etc.
- **2,330+ File Stem Associations**: Recognizes exact filenames (`Cargo.toml`, `Makefile`, `Dockerfile`, `.env`, etc.) with case insensitivity.
- **Light and Dark Appearance**: Works in both light and dark Zed modes.

## Zed Directory Structure

Conforms to Zed's official Icon Theme Schema (`https://zed.dev/schema/icon_themes/v0.3.0.json`):

```text
zed-mizu/
├── extension.toml
├── icon_themes/
│   └── mizu.json
├── icons/
│   ├── folder.svg
│   ├── folderX.svg
│   ├── file.svg
│   └── *.svg (970+ SVGs)
├── build.js
└── test.js
```

## Activation in Zed

In Zed, open your settings (`~/.config/zed/settings.json` or `ctrl-,`) and set:

```json
{
  "icon_theme": {
    "mode": "dark",
    "dark": "Mizu",
    "light": "Mizu Light"
  }
}
```

Or open the Command Palette (`ctrl-shift-p`) and search:
`icon theme: select` -> choose **Mizu**.

## Validation & Verification

Run the validation suite:

```bash
node test.js
```

## Rebuilding

To rebuild or regenerate the icons from the upstream `mizu` source repository:

```bash
node --experimental-strip-types build.js
```

## Credits

- **Original Creator**: Artwork, icon designs, and the original VS Code extension created by **[m39u](https://github.com/m39u)** ([m39u/mizu](https://github.com/m39u/mizu)).
- **Zed Port**: Ported and adapted for Zed editor by **[SniperRavan](https://github.com/SniperRavan)** ([SniperRavan/zed-mizu](https://github.com/SniperRavan/zed-mizu)).

## License

MIT License. See [LICENSE](./LICENSE) for details.
