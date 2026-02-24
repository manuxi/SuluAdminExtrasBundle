# SuluAdminExtrasBundle

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/manuxi/SuluAdminExtrasBundle/blob/main/LICENSE)
![GitHub Tag](https://img.shields.io/github/v/tag/manuxi/SuluAdminExtrasBundle)
![Supports Sulu 3.0 or later](https://img.shields.io/badge/Sulu->=3.0-0088cc?color=00b2df)

A bundle for **Sulu CMS** that adds useful **Content Types** (Form Fields) and **List Transformers** (Visualizations) to the Admin UI.

This bundle combines and modernizes functionality from the former `SuluContentTypesBundle` and `SuluTweaksBundle` for Sulu 3.0.

**English** | [🇩🇪 Deutsch](README.de.md)

---

## 📚 Features & Documentation

Detailed documentation for each feature can be found in the `docs/` folder:

### Content Types
*   **[Colour Select](docs/color_select.md)** - Colour selection with colour display for better visualisation
*   **[Number With Default](docs/number_with_default.md)** - Number with storable default value (fixes Sulu limitation)
*   **[Slider Range](docs/slider_range.md)** - Slider
*   **[Star Rating](docs/star_rating.md)** - Selection field for star rating
*   **[DateTime Start / End](docs/datetime_start_end.en.md)** - Linked date-time pickers with auto end-time, business hours validation and next-slot finder
*   **[DateTime With Default](docs/datetime_with_default.en.md)** - Date-time picker with working `default_value` support (fixes Sulu limitation)
*   **[Business Hours](docs/business_hours.en.md)** - Weekly schedule with time slots, breaks and copy function
*   **[Public Holidays](docs/public_holidays.en.md)** - Holiday manager with Nager.Date API integration
*   **[Holiday Dates](docs/holiday_dates.en.md)** - Company holidays and closure periods with recurring support
*   **[Collapsible Sections](docs/collapsible_sections.md)** - Auto-collapsible XML sections in the Admin UI

### List Transformers
*   **[Percent Bar](docs/percent_bar.md)** - Percentage bar
*   **[Publish State](docs/publish_state.md)** - Status display in separate column (default is hidden)
*   **[Ghost Locale](docs/ghost_locale.md)** - Language status in separate column (hidden by default)
*   **[Type Colour](docs/type_colour.md)** - Colour display for colour categorisation
*   **[Star Rating](docs/star_rating.md)** - Star rating
*   **[Color Dot](docs/color_dot.en.md)** - Colored circle from hex value for quick visual identification in lists

---

## 🚀 Installation

**Requirement:** Sulu CMS 3.0+

### 1. Install via Composer
```bash
composer require manuxi/sulu-admin-extras-bundle
```

### 2. Register Bundle
Add to `config/bundles.php`:
```php
return [
    Manuxi\SuluAdminExtrasBundle\SuluAdminExtrasBundle::class => ['all' => true],
];
```

### 3. Admin Assets Setup (Crucial Step)
To load the JavaScript components in the Sulu Admin, you must adjust your project's asset configuration.

**A) Update `assets/admin/package.json`**
Open the file `assets/admin/package.json` in your project root. Add or update the dependency to point to the bundle's resources:

```json
{
  "dependencies": {
    "sulu-admin-extras-bundle": "file:../../vendor/manuxi/sulu-admin-extras-bundle/src/Resources"
  }
}
```

**B) Update `assets/admin/app.js`**
Open `assets/admin/app.js` (or `index.js`) and import the bundle:

```javascript
import 'sulu-admin-extras-bundle';
```

**C) Install & Build**
Run the following commands to compile the admin assets:
```bash
cd assets/admin
npm install
npm run build
```

---

## ⚙️ Configuration
Copy the default configuration file:
```bash
cp vendor/manuxi/sulu-admin-extras-bundle/src/Resources/config/default.yaml config/packages/sulu_admin_extras.yaml
```

See [docs](docs/) for detailed configuration options.
