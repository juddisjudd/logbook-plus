# Logbook+ - Arc Raiders Overlay

A lightweight Tauri-based frameless overlay application for the [Arc Raiders](https://www.arcraiders.com/) game. Track quests, hideout progression, and blueprints with a sleek, always-on-top interface designed to stay out of your way during gameplay.

## Features

- **Quest Tracker** - Search and track quests by name, mark individual objectives as complete
- **Hideout Tracker** - Monitor hideout facility upgrades with level selection and requirements display
- **Blueprint Tracker** - Track collected blueprints across 40 different items
- **System Tray Integration** - Quick access from Windows system tray with window toggle and settings
- **Global Hotkey** - Press F10 (or configure custom hotkey) to show/hide the overlay
- **Auto-Update** - Automatically checks for new releases and notifies you of available updates
- **Frameless Window** - Always-on-top, minimal UI designed to complement gameplay
- **Dark Theme** - Arc Raiders aesthetic with warm orange accents (#F2A413)

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
   - Build the application for Windows (x86_64)
   - Create a GitHub release
   - Upload installers and portable binary as release assets

### Release Assets

- **Windows**: `.msi` installer and portable `.exe` executable

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
- **Auto-Update**: Tauri Plugin Updater
- **UI Framework**: Custom CSS with Arc Raiders aesthetic

## Data Sources

This project utilizes game data from:
- **[arcraiders-data](https://github.com/RaidTheory/arcraiders-data)** - Comprehensive Arc Raiders game data repository

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Arc Raiders is a registered trademark of Embark Studios. This project is an unofficial overlay tool and is not affiliated with or endorsed by Embark Studios.

## Contributing

Contributions are welcome! Please:
1. Follow the coding standards in STANDARDS.md
2. Review the aesthetic guidelines in AESTHETICS-GUIDE.md
3. Submit PRs with clear descriptions of changes

## IDE Setup

Recommended development environment:
- **VS Code** + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
