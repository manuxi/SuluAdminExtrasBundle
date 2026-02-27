# SuluAdminExtrasBundle

![php workflow](https://github.com/manuxi/SuluAdminExtrasBundle/actions/workflows/js-tests.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/manuxi/SuluAdminExtrasBundle/blob/main/LICENSE)
![GitHub Tag](https://img.shields.io/github/v/tag/manuxi/SuluAdminExtrasBundle)
![Github Release](https://img.shields.io/github/v/release/manuxi/SuluAdminExtrasBundle?color=116ea3)
![Supports Sulu 3.0 or later](https://img.shields.io/badge/%20Sulu->=3.0-0088cc?color=00b2df)

Ein Bundle für **Sulu CMS**, das nützliche Tools wie **Content Types** (Formularfelder) und **List Transformers** (Visualisierungen) zur Admin-Oberfläche hinzufügt.

Dieses Bundle kombiniert und modernisiert Funktionen der ehemaligen `SuluContentTypesBundle` und `SuluTweaksBundle` für Sulu 3.0.

[🇬🇧 Read English](README.md) | **Deutsch**

---

## 📚 Funktionen & Dokumentation

Detaillierte Dokumentationen für jedes Feature befinden sich im `docs/` Ordner:

### Property Types (Formularfelder)
*   **[Color Select](docs/color_select.de.md)** - Farbauswahl mit visueller Vorschau (Liste: [Type Color](docs/type_color.de.md), s.u.)
*   **[Number With Default](docs/number_with_default.de.md)** - Zahl mit `default_value`-Unterstützung
*   **[Slider Range](docs/slider_range.de.md)** - Schieberegler
*   **[Star Rating](docs/star_rating.de.md)** - Auswahlfeld für Sternebewertung
*   **[DateTime Start / End](docs/datetime_start_end.de.md)** - Verlinkte Date-Time-Picker mit auto End-Zeit, Validierung von Öffnungszeiten und "Freie-Zeit-Finder"
*   **[DateTime With Default](docs/datetime_with_default.de.md)** - Date-Time-Picker mit `default_value`-Unterstützung
*   **[Business Hours](docs/business_hours.de.md)** - Wochenplan mit Zeitfenstern, Pausen und Kopierfunktion
*   **[Public Holidays](docs/public_holidays.de.md)** - Feiertags-Manager mit Nager.Date-API-Integration
*   **[Holiday Dates](docs/holiday_dates.de.md)** - Betriebsferien und Schließungszeiten mit Unterstützung wiederkehrender Daten
*   **[Single Contact Autocomplete](docs/single_contact_autocomplete.de.md)** - Einzel-Kontakt-Auswahl mit Autocomplete-Funktion

### List Transformers (Listenansicht)
*   **[Percent Bar](docs/percent_bar.de.md)** - Prozentbalken
*   **[Publish State](docs/publish_state.de.md)** - Anzeige Veröffentlichungsstatus in eigener Spalte (Standard wird ausgeblendet)
*   **[Ghost Locale](docs/ghost_locale.de.md)** - Sprachstatus in eigener Spalte (Standard wird ausgeblendet)
*   **[Type Color](docs/type_color.de.md)** - Farbanzeige  (Form: [Color Select](docs/color_select.de.md), s.o.)
*   **[Star Rating](docs/star_rating.de.md)** - Sternebewertung
*   **[Color Dot](docs/color_dot.de.md)** - Farbiger Kreis aus Hex-Wert zur schnellen visuellen Identifikation in Listen
*   **[Status Switcher](docs/status_switcher.de.md)** - Interaktiver Inline-Status-Umschalter mit Dropdown zum direkten Ändern des Entity-Status

### Sonstiges
*   **[Collapsible Sections](docs/collapsible_sections.de.md)** - Aufklappbare Formular-Sektionen im Admin UI (hacky)
*   **[AddNewToolbarAction](docs/add_new_toolbar_action.de.md)** - "Neu"-Button in Action-Toolbar eines Elements

---

## 🚀 Installation

**Voraussetzung:** Sulu CMS 3.0+

### 1. Installation über Composer
```bash
composer require manuxi/sulu-admin-extras-bundle
```

### 2. Bundle registrieren
Bundle in `config/bundles.php` hinzufügen:
```php
return [
    Manuxi\SuluAdminExtrasBundle\SuluAdminExtrasBundle::class => ['all' => true],
];
```

### 3. Admin Assets einrichten (Wichtiger Schritt)
Damit die JavaScript-Komponenten im Sulu Admin geladen werden, müssen die Asset-Konfiguration des Projekts angepasst werden.

**A) `assets/admin/package.json` anpassen**
Datei `assets/admin/package.json` im Projekt-Root öffnen. Folgende Abhängigkeit hinzufügen:

```json
{
  "dependencies": {
    "sulu-admin-extras-bundle": "file:../../vendor/manuxi/sulu-admin-extras-bundle/src/Resources"
  }
}
```

**B) `assets/admin/app.js` anpassen**
`assets/admin/app.js` (oder `index.js`) öffnen und das Bundle importieren:

```javascript
import 'sulu-admin-extras-bundle';
```

**C) Installieren & Bauen**
Folgende Befehle ausführen, um die Admin-Assets neu zu kompilieren:
```bash
cd assets/admin
npm install
npm run build
```

---

## ⚙️ Konfiguration
Kopieren der Standard-Konfigurationsdatei:
```bash
cp vendor/manuxi/sulu-admin-extras-bundle/src/Resources/config/default.yaml config/packages/sulu_admin_extras.yaml
```

Siehe [docs](docs/) für detaillierte Konfigurationsoptionen.
