<p align="center">
  <img src="public/icon/256.png" alt="Oneiro" width="128" height="128" />
</p>

<h1 align="center">oneiro</h1>

<p align="center">
  Takes the character 「梦」(dream) to pay homage to the original project 「浮生梦」<br/>
  <em>Derived from the Greek word oneiros (ὄνειρος), meaning "dream"</em>
</p>

<p align="center">
  An elegant Chrome new tab extension<br/>
  Displays Chinese classic poetry on the new tab page, and shows browser bookmarks in Apple style
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📖 Classic Poetry | Displays Chinese classic poetry on the new tab page, fully offline data |
| 🗂️ Content Sources | Multiple new content source categories added (poetry / lyrics / literature / animation / games, etc.), selectable in the bottom-left settings menu |
| 🔖 Bookmark Bar | Apple-style rounded icons, displaying browser bookmark bar content |
| 🚀 Quick Sites | Custom quick-access shortcuts for frequently visited sites, with auto-fetching icons |
| 📐 Smart Space | Dynamically senses screen space, automatically reduces line count, maintaining elegant whitespace at all times |
| 📂 Nested Folders | Frosted glass popup panel, supports multi-level recursive expansion |
| 🔄 Real-time Sync | Browser bookmark additions, deletions, and modifications are instantly reflected |
| 🎨 7 Fonts | Multiple Chinese-style fonts are switchable, with the current font name displayed in the bottom-right corner |
| 🌗 Theme Switching | Three modes: Light / Dark / Follow System |
| ⚙️ Customizable Line Count | Bookmark display line count adjustable from 1-4 rows |
| ⚡ Lightning Fast Loading | Fully offline operation, optimized for low-power devices |
| 🪟 Independent Popup | Click the extension icon to invoke the interface on any page |

## 📸 Preview

![Light Theme](preview/chrome_light.png)

![Popup Panel](preview/popup.png)

![Dark Theme](preview/chrome_dark.png)

## 🛠️ Tech Stack

`WXT` · `React` · `TailwindCSS v4` · `DaisyUI`

## 📦 Installation

### Method 1: Download Release Package

Go to the [Releases](../../releases) page to download the zip package for the corresponding browser:

| Package | Compatible Browser |
|---------|-------------------|
| `oneiro-<version>-chrome.zip` | Chrome |
| `oneiro-<version>-edge.zip` | Edge |
| `oneiro-<version>-firefox.zip` | Firefox |

#### Chrome

1. Download `oneiro-<version>-chrome.zip` and extract it
2. Open `chrome://extensions/`
3. Enable **Developer Mode** in the top-right corner
4. Click **Load Unpacked Extension** and select the extracted `chrome-mv3` folder

#### Edge

1. Download `oneiro-<version>-edge.zip` and extract it
2. Open `edge://extensions/`
3. Enable **Developer Mode** in the bottom-left corner
4. Click **Load Unpacked Extension** and select the extracted `edge-mv3` folder

#### Firefox

1. Download `oneiro-<version>-firefox.zip` and extract it
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Temporary Add-on** and select `manifest.json` from the extracted `firefox-mv2` folder

> ⚠️ Firefox temporary extensions are automatically unloaded when the browser is closed and need to be reloaded.

### Method 2: Build from Source

```bash
# Chrome / Edge
pnpm install
pnpm run build

# Firefox
pnpm run build --browser firefox
```

Build output directories are `.output/chrome-mv3/` and `.output/firefox-mv2/` respectively.

## 📋 Roadmap

- [x] Apple-style bookmark bar
- [x] Multiple Chinese font switching
- [x] Light/dark theme auto-adaptation
- [x] Custom quick access websites (Quick Sites)
- [ ] Import poetry from more custom sources
- [ ] Custom background
- [ ] Search box
- [ ] Custom font import

## 📝 Changelog

<details>
  <summary><strong>v2.3.0</strong></summary>

**New**
- Added multiple content source categories (poetry / lyrics / literature / animation / games, etc.), selectable in the bottom-left settings menu.

**Optimizations**
- Poetry data source expanded to `sentences-bundle` multi-category, automatically reshuffles order when switching categories.
- Font subsetting script covers new content/components and automatically aggregates styles from `assets/fonts/build/` output.

**Bug Fixes**
- Avoids duplicate poetry fetching caused by category initialization on first mount.
</details>

<details>
  <summary><strong>v2.2.0</strong></summary>

**New**
- Added extension icon Popup panel: convenient for invoking the bookmark and quick sites panel from any page.
- Diverse bookmark view matrix: added "Magazine View" and "List View" to meet different layout needs, nested folders also inherit the layout.
- Independent Popup display logic: the Popup triggered by clicking the extension always shows all data, unaffected by the home page's hidden settings.

**Bug Fixes**
- Chrome Storage native data migration: smooth transition of historical URL records, preventing bookmark and quick site loss when users manually overwrite and update the extension.
</details>

<details>
  <summary><strong>v2.1.0</strong></summary>

**New**
- Quick Sites: Added a quick sites sidebar, supporting custom addition, editing, and auto-fetching of Favicon.
- Dynamic height adaptation: Bookmarks and quick sites dynamically allocate maximum rows based on current screen height and support collapsing, preventing screen overflow.

**Optimizations**
- Settings panel upgrade: Reorganized into "Appearance" and "Display" groups, introducing intuitive toggle components for control items.
- Shuffle algorithm optimization: Adopts the Fisher-Yates shuffle algorithm to reduce the repetition issue of randomly appearing poetry lines.
</details>

<details>
  <summary><strong>v2.0.0</strong></summary>

**New**
- Apple-style bookmark bar with rounded icons displaying browser bookmarks.
- Nested folder expansion, frosted glass popup panel, supports multi-level recursion.
- Real-time sync of browser bookmark additions, deletions, and modifications, with customizable bookmark display rows (1-4 rows).
- Hover tooltip shows full bookmark name and URL, current font name displayed in bottom-right corner.
- Brand new extension icon: "Dream" character in a Zen style + red circular background.

**Optimizations**
- Text inside folders uniformly uses Xiaowen Kai (霞鹜文楷) font.
- Font fallback chain prioritizes Xiaowen Kai, reducing missing character issues.
</details>

## Acknowledgments

This project is a secondary development based on [xxnuo/jizhi-mod](https://github.com/xxnuo/jizhi-mod) (Jizhi v1.3.3).

- Fonts from [Chinese Font Project](https://chinese-font.netlify.app/)
- Original inspiration from [unicar9/jizhi](https://github.com/unicar9/jizhi) (Jizhi)

## 📄 License

This project is open source under the [MIT License](LICENSE). Feel free to enjoy and follow the open source license.
