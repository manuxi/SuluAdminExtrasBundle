# SuluAdminExtrasBundle

Ein Bundle für **Sulu CMS**, das nützliche **Content Types** (Formularfelder) und **List Transformers** (Visualisierungen) zur Admin-Oberfläche hinzufügt.

Dieses Bundle kombiniert und modernisiert Funktionen der ehemaligen `SuluContentTypesBundle` und `SuluTweaksBundle` für Sulu 3.0.

> [🇬🇧 Read English Documentation (Englische Dokumentation lesen)](README.md)

---

## 📚 Funktionen & Dokumentation

Detaillierte Dokumentationen für jedes Feature liegen im `docs/` Ordner:

### Content Types (Formularfelder)
*   [Farbauswahl (Color Select)](docs/color_select.de.md)
*   [Zahl mit Standardwert (Number With Default)](docs/number_with_default.de.md)
*   [Schieberegler (Slider Range)](docs/slider_range.de.md)
*   [Sternebewertung (Star Rating)](docs/star_rating.de.md)

### List Transformers (Listenansicht)
*   [Prozentbalken (Percent Bar)](docs/percent_bar.de.md)
*   [Statusanzeige (Publish State)](docs/publish_state.de.md)
*   [Sprachstatus (Ghost Locale)](docs/ghost_locale.de.md)
*   [Typ-Farbe (Type Color)](docs/type_color.de.md)
*   [Sternebewertung (Star Rating)](docs/star_rating.de.md)

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
Damit die JavaScript-Komponenten im Sulu Admin geladen werden, müssen die Asset-Konfiguration im Projekt angepasst werden.

**A) `assets/admin/package.json` anpassen**
Datei `assets/admin/package.json` bearbeiten:

```json
{
  "dependencies": {
    "sulu-admin-extras-bundle": "file:../../vendor/manuxi/sulu-admin-extras-bundle/src/Resources"
  }
}
```

**B) `assets/admin/app.js` anpassen**
(oder `index.js`) und Bundle importieren:

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
Erstellen/Kopieren der Standard-Konfigurationsdatei:
```bash
cp vendor/manuxi/sulu-admin-extras-bundle/src/Resources/config/default.yaml config/packages/sulu_admin_extras.yaml
```

Siehe [docs](docs/) für detaillierte Konfigurationsoptionen.
