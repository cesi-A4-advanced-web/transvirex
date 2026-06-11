# Design System — Transvirex Logistics

Design reference extracted from the Figma file **Mockups** (page "Design Pallet").  
This document is intended for front-end development.

---

## 1. Font Family

**Family**: `Inter`

---

## 2. Typography

All text colors default to `--text-primary` (`#020617`) unless otherwise specified.

| Role        | CSS var       | Size | Weight        |
| ----------- | ------------- | ---- | ------------- |
| Heading 1   | `--heading-1` | 42px | Bold (700)    |
| Heading 2   | `--heading-2` | 37px | Bold (700)    |
| Heading 3   | `--heading-3` | 32px | Bold (700)    |
| Heading 4   | `--heading-4` | 26px | Bold (700)    |
| Heading 5   | `--heading-5` | 24px | Medium (500)  |
| Heading 6   | `--heading-6` | 22px | Medium (500)  |
| Text (body) | `--text`      | 12px | Regular (400) |
| Caption     | —             | 10px | Regular (400) |

- **Caption** uses `--general/muted-foreground` (`#737373`).
- **Body text** uses `--text-primary` (`#020617`).

---

## 3. Color Palette

### 3.1 Brand Colors

| Token               | Variant | Hex       |
| ------------------- | ------- | --------- |
| `--primary`         | Default | `#6366f1` |
| `--primary-dark`    | Dark    | `#4338ca` |
| `--primary-light`   | Light   | `#a5b4fc` |
| `--secondary`       | Default | `#10b981` |
| `--secondary-dark`  | Dark    | `#047857` |
| `--secondary-light` | Light   | `#6ee7b7` |
| `--accent`          | Default | `#f59e0b` |
| `--accent-dark`     | Dark    | `#d97706` |
| `--accent-light`    | Light   | `#fcd34d` |

### 3.2 Neutral Colors (Slates)

Full scale based on Tailwind Slate.

| Token              | Step | Hex       |
| ------------------ | ---- | --------- |
| `--slate/50`       | 50   | `#f8fafc` |
| `--background`     | 100  | `#f1f5f9` |
| `--slate/200`      | 200  | `#e2e8f0` |
| `--slate/300`      | 300  | `#cbd5e1` |
| `--slate/400`      | 400  | `#94a3b8` |
| `--surface`        | 500  | `#64748b` |
| `--surface-hover`  | 600  | `#475569` |
| `--slate/700`      | 700  | `#334155` |
| `--surface-border` | 800  | `#1e293b` |
| `--slate/900`      | 900  | `#0f172a` |
| `--text-primary`   | 950  | `#020617` |

### 3.3 Semantic Colors

Each semantic color comes in three variants: **light**, **default (neutral)**, **dark**.

#### Warning (Orange)

| Token          | Hex       |
| -------------- | --------- |
| `--orange/100` | `#ffedd5` |
| `--orange/500` | `#f97316` |
| `--orange/700` | `#c2410c` |

#### Success (Green)

| Token         | Hex       |
| ------------- | --------- |
| `--green/100` | `#dcfce7` |
| `--green/500` | `#22c55e` |
| `--green/700` | `#15803d` |

#### Error (Red)

| Token       | Hex       |
| ----------- | --------- |
| `--red/100` | `#ffe2e2` |
| `--red/500` | `#ef4444` |
| `--red/700` | `#b91c1c` |

#### Info (Blue)

| Token        | Hex       |
| ------------ | --------- |
| `--blue/100` | `#dbeafe` |
| `--blue/500` | `#3b82f6` |
| `--blue/700` | `#1d4ed8` |

---

## 4. Assets — Logo & Icon

All files are available in the `assets/` folder at the project root.

### 4.1 Icon

Folder: `assets/icon/`

Three color variants available: **color**, **black**, **white**.

| File                    | Usage                                              |
| ----------------------- | -------------------------------------------------- |
| `icon-color.svg`        | General use (vector SVG)                           |
| `icon-black.svg`        | On light backgrounds                               |
| `icon-white.svg`        | On dark backgrounds                                |
| `icon-color-{size}.png` | Bitmap at sizes: 16, 32, 64, 128, 256, 512, 1024px |
| `icon-black-{size}.png` | Same, black variant                                |
| `icon-white-{size}.png` | Same, white variant                                |

**Prefer SVG** for all web integrations. Use PNG only for favicons or contexts that do not support SVG.

Available PNG sizes: `16x16`, `32x32`, `64x64`, `128x128`, `256x256`, `512x512`, `1024x1024`.

### 4.2 Full Logo

Folder: `assets/logo/`

Three color variants: **color**, **black**, **white**.

| File                    | Usage                                               |
| ----------------------- | --------------------------------------------------- |
| `logo-color.svg`        | General use (vector SVG)                            |
| `logo-black.svg`        | On light backgrounds                                |
| `logo-white.svg`        | On dark backgrounds                                 |
| `logo-color-{size}.png` | Bitmap at resolutions: 512x256, 1024x512, 2048x1024 |
| `logo-black-{size}.png` | Same, black variant                                 |
| `logo-white-{size}.png` | Same, white variant                                 |

The logo exists in two forms in the design:

- **Logo full**: complete logotype (text + icon), ~2:1 ratio
- **Logo short**: icon only (square)

**Prefer SVG** for web integration. PNG files are provided for contexts requiring a bitmap (Open Graph, email, etc.).

---

## 5. Suggested CSS Variables

Sample `:root` declaration to include in the global stylesheet:

```css
:root {
    /* Brand */
    --primary: #6366f1;
    --primary-dark: #4338ca;
    --primary-light: #a5b4fc;
    --secondary: #10b981;
    --secondary-dark: #047857;
    --secondary-light: #6ee7b7;
    --accent: #f59e0b;
    --accent-dark: #d97706;
    --accent-light: #fcd34d;

    /* Neutrals */
    --background: #f1f5f9;
    --surface: #64748b;
    --surface-hover: #475569;
    --surface-border: #1e293b;
    --text-primary: #020617;

    /* Semantic — Warning */
    --orange-100: #ffedd5;
    --orange-500: #f97316;
    --orange-700: #c2410c;

    /* Semantic — Success */
    --green-100: #dcfce7;
    --green-500: #22c55e;
    --green-700: #15803d;

    /* Semantic — Error */
    --red-100: #ffe2e2;
    --red-500: #ef4444;
    --red-700: #b91c1c;

    /* Semantic — Info */
    --blue-100: #dbeafe;
    --blue-500: #3b82f6;
    --blue-700: #1d4ed8;

    /* Typography */
    --heading-1: 42px;
    --heading-2: 37px;
    --heading-3: 32px;
    --heading-4: 26px;
    --heading-5: 24px;
    --heading-6: 22px;
    --text: 12px;
}
```
