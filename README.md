# Logbook+

A Tauri-based frameless overlay application for Arc Raiders game. Track quests, hideout progression, blueprints, and items with a sleek, always-on-top interface.

## Features

- **Quest Tracker** - Search and track quests by name or trader, mark individual objectives as complete
- **Hideout Tracker** - Monitor hideout facility upgrades with level selection and requirements display
- **Blueprint Tracker** - Track collected blueprints across 40 different items
- **Item List** - (Coming soon)
- **System Tray Integration** - Quick access from Windows system tray
- **Global Hotkey** - Press F10 (or custom hotkey) to show/hide the overlay
- **Frameless Window** - Always on top, minimal UI for immersive gameplay
- **Dark Theme** - Arc Raiders aesthetic with warm orange accents

## Development

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v20 or later)
- [Bun](https://bun.sh)
- [Tauri CLI](https://tauri.app/en/guides/getting-started/setup/)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Run development server:
   ```bash
   bun tauri dev
   ```

### Build

Build the application for production:

```bash
bun run build
bun tauri build
```

## Releases

### Creating a Release

Releases are automatically created when you push a git tag. To create a new release:

1. Update the version in `src-tauri/Cargo.toml` and `package.json`
2. Create and push a tag:
   ```bash
   git tag -a v0.2.0 -m "Release version 0.2.0"
   git push origin v0.2.0
   ```

3. The GitHub Actions workflow will automatically:
   - Build the application for Windows, macOS, and Linux
   - Create a GitHub release
   - Upload installers and binaries as release assets

### Release Assets

- **Windows**: `.msi` installer and portable `.exe`
- **macOS**: `.dmg` disk image (Universal binary for x86_64 and aarch64)
- **Linux**: AppImage and `.deb` packages

## Project Structure

```
logbook-overlay/
├── src/                       # Vue 3 frontend
│   ├── components/           # Vue components
│   │   ├── trackers/        # Tracker implementations
│   │   ├── AppHeader.vue    # Main header with logo
│   │   └── SettingsPanel.vue # Settings configuration
│   ├── composables/         # Vue composition functions
│   ├── types/              # TypeScript interfaces
│   ├── data/               # JSON data files
│   └── styles/             # CSS styling
├── src-tauri/              # Tauri Rust backend
│   ├── src/lib.rs         # Main Tauri app logic
│   └── Cargo.toml         # Rust dependencies
├── .github/workflows/      # CI/CD automation
│   ├── release.yml        # Automated release builds
│   └── build.yml          # Build verification
└── package.json           # NPM/Bun dependencies
```

## Configuration

### Hotkey Settings

Access settings via:
- Click the ⚙ icon in the header
- Right-click system tray → Settings

Default hotkey: **F10**

Supported hotkey formats:
- Single keys: `F10`, `F1`-`F24`
- Key combinations: `ctrl+shift+l`, `alt+k`, `ctrl+alt+m`

## Technologies

- **Frontend**: Vue 3, TypeScript, Vite
- **Desktop**: Tauri 2
- **Package Manager**: Bun
- **Build**: Cargo (Rust)
- **UI Framework**: Custom CSS with Arc Raiders aesthetic

## License

Licensed under the Arc Raiders game terms. See LICENSE file for details.

## Contributing

Contributions are welcome! Please:
1. Follow the coding standards in STANDARDS.md
2. Review the aesthetic guidelines in AESTHETICS-GUIDE.md
3. Submit PRs with clear descriptions of changes

## IDE Setup

Recommended development environment:
- **VS Code** + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
