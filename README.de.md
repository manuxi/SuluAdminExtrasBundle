# SuluAdminExtrasBundle

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/manuxi/SuluAdminExtrasBundle/blob/main/LICENSE)
![GitHub Tag](https://img.shields.io/github/v/tag/manuxi/SuluAdminExtrasBundle)
![Supports Sulu 3.0 or later](https://img.shields.io/badge/Sulu->=3.0-0088cc?color=00b2df)

> [🇬🇧 Read English](README.md) | **Deutsch**

Ein Bundle für **Sulu CMS**, das nützliche **Content Types** (Formularfelder) und **List Transformers** (Visualisierungen) zur Admin-Oberfläche hinzufügt.

Dieses Bundle kombiniert und modernisiert Funktionen meiner `SuluContentTypesBundle` und `SuluTweaksBundle` für Sulu 3.0.

## ✨ Features

### Content Types (Formularfelder)
- **[Color Select](docs/color_select.de.md)** - Farbauswahl mit visueller Vorschau zur besseren Visualisierung
- **[Number With Default](docs/number_with_default.de.md)** - Zahl mit hinterlegbarem Standardwert
- **[Slider Range](docs/slider_range.de.md)** - Schieberegler
- **[Star Rating](docs/star_rating.de.md)** - Auswahlfeld für Sternebewertung

### List Transformers (Listenansicht)
- **[Percent Bar](docs/percent_bar.de.md)** - Prozentbalken
- **[Publish State](docs/publish_state.de.md)** - Statusanzeige in eigener Spalte (Standard wird ausgeblendet)
- **[Ghost Locale](docs/ghost_locale.de.md)** - Sprachstatus in eigener Spalte (Standard wird ausgeblendet)
- **[Type Color](docs/type_color.de.md)** - Farbanzeige zur farblichen Kategorisierung
- **[Star Rating](docs/star_rating.de.md)** - Sternebewertung

## 📋 Voraussetzungen

- PHP 8.2+
- Sulu CMS 3.0+
- Symfony 6.4+ / 7.0+

## 🚀 Installation

### Schritt 1: Installation über Composer
```bash
composer require manuxi/sulu-admin-extras-bundle
```

### Schritt 2: Bundle registrieren
Bundle in `config/bundles.php` hinzufügen:
```php
return [
    Manuxi\SuluAdminExtrasBundle\SuluAdminExtrasBundle::class => ['all' => true],
];
```

### Schritt 3: Admin Assets einrichten (obligatorisch)
Damit die JavaScript-Komponenten im Sulu Admin geladen werden, müssen die Asset-Konfiguration im Projekt angepasst werden.

**A) Datei `assets/admin/package.json` bearbeiten:**

```json
{
  "dependencies": {
    "sulu-admin-extras-bundle": "file:../../vendor/manuxi/sulu-admin-extras-bundle/src/Resources"
  }
}
```

**B) `assets/admin/app.js` (oder `index.js`) anpassen und Bundle importieren:**

```javascript
import 'sulu-admin-extras-bundle';
```

**C) Installieren & kompilieren:**

Folgende Befehle ausführen, um die Admin-Assets neu zu kompilieren:
```bash
cd assets/admin
npm install
npm run build
```

---

## 🧶 Konfiguration

`config/packages/sulu_admin_extras.yaml` erstellen
(oder Standard-Konfiguration aus dem Bundle kopieren: vendor/manuxi/sulu-admin-extras-bundle/src/Resources/config/packages/sulu_admin_extras.yaml)
und nach Wunsch anpassen.



Ausführliche Konfigurationsoptionen befinden sich in den detaillierten Dokumentationen unter docs/ (oben unter „Features” verlinkt).

## 👩‍🍳 Mitwirken

Beiträge sind willkommen! Issues und Pull Requests können gerne eingereicht werden.

## 📄 Lizenz

Dieses Bundle steht unter der [MIT-Lizenz](LICENSE).
