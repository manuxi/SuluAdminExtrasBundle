# SuluAdminExtrasBundle

A bundle for **Sulu CMS** that adds useful **Content Types** (Form Fields) and **List Transformers** (Visualizations) to the Admin UI.

This bundle combines and modernizes functionality from the former `SuluContentTypesBundle` and `SuluTweaksBundle` for Sulu 3.0.

> [🇩🇪 Deutsche Dokumentation lesen (Read German Documentation)](README.de.md)

---

## 📚 Features & Documentation

Detailed documentation for each feature can be found in the `docs/` folder:

### Content Types
*   [Color Select](docs/color_select.md)
*   [Number With Default](docs/number_with_default.md)
*   [Slider Range](docs/slider_range.md)
*   [Star Rating](docs/star_rating.md)

### List Transformers
*   [Percent Bar](docs/percent_bar.md)
*   [Publish State](docs/publish_state.md)
*   [Ghost Locale](docs/ghost_locale.md)
*   [Type Color](docs/type_color.md)
*   [Star Rating](docs/star_rating.md)

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
npm install --save classnames
npm install
npm run build
```

---

## ⚙️ Configuration
Generate the default configuration file:
```bash
cp vendor/manuxi/sulu-admin-extras-bundle/src/Resources/config/default.yaml config/packages/sulu_admin_extras.yaml
```

See [docs](docs/) for detailed configuration options.
