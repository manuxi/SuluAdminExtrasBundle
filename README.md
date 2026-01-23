# SuluAdminExtrasBundle

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/manuxi/SuluAdminExtrasBundle/blob/main/LICENSE)
![GitHub Tag](https://img.shields.io/github/v/tag/manuxi/SuluAdminExtrasBundle)
![Supports Sulu 3.0 or later](https://img.shields.io/badge/Sulu->=3.0-0088cc?color=00b2df)

> **English** | [🇩🇪 Deutsch](README.de.md)

A bundle for **Sulu CMS** that adds useful **Content Types** (Form Fields) and **List Transformers** (Visualizations) to the Admin UI.

This bundle combines and modernizes functionality from the former `SuluContentTypesBundle` and `SuluTweaksBundle` for Sulu 3.0.

## ✨ Features

### Content Types (Form Fields)
- **[Colour Select](docs/colour_select.md)** - Colour selection with colour display for better visualisation
- **[Number With Default](docs/number_with_default.md)** - Number with storable default value
- **[Slider Range](docs/slider_range.md)** - Slider
- **[Star Rating](docs/star_rating.md)** - Selection field for star rating

### List Transformers (list view)
- **[Percent Bar](docs/percent_bar.md)** - Percentage bar
- **[Publish State](docs/publish_state.md)** - Status display in separate column (default is hidden)
- **[Ghost Locale](docs/ghost_locale.md)** - Language status in separate column (hidden by default)
- **[Type Colour](docs/type_colour.md)** - Colour display for colour categorisation
- **[Star Rating](docs/star_rating.md)** - Star rating

## 📋 Requirements

- PHP 8.2+
- Sulu CMS 3.0+
- Symfony 6.4+ / 7.0+

---

## 🚀 Installation

**Requirement:** Sulu CMS 3.0+

### Step 1: Install via Composer
```bash
composer require manuxi/sulu-admin-extras-bundle
```

### Step 2: Register Bundle
Add to `config/bundles.php`:
```php
return [
    Manuxi\SuluAdminExtrasBundle\SuluAdminExtrasBundle::class => ['all' => true],
];
```

### Step 3: Admin Assets Setup
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
npm install --save classnames
npm install
npm run build
```

---
## 🧶 Configuration

Create `config/packages/sulu_admin_extras.yaml`
(or copy it from the bundle: vendor/manuxi/sulu-admin-extras-bundle/src/Resources/config/packages/sulu_admin_extras.yaml)
and modify it to your needs.

See detailed configuration options in the detailed documentations in docs/ (linked above under features).

## 👩‍🍳 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

This bundle is released under the [MIT License](LICENSE).