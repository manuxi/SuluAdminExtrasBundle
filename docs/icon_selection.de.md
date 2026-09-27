# Icon Selection

Sulu 3.0 bringt bereits einen eigenen Feldtyp `single_icon_selection` mit: Redakteure wählen ein Icon aus einem
konfigurierten `icon_set` (ein `svg://`-Ordner mit einzelnen SVG-Dateien oder ein `icomoon://`-Icon-Font) in
einem Such-Overlay aus. Zwei Lücken bleiben: Das Formularfeld selbst zeigt nur den gespeicherten Icon-**Namen**
als reinen Text (keine Vorschau), und es gibt weder Twig-Funktion noch Property-Resolver, um das Icon im
Frontend auszugeben.

Dieses Bundle behebt beides, **ohne Sulus eigene Icon-Verwaltung zu duplizieren** – kein Sprite-Bau, kein
eigenes Speicherformat, kein neuer Feldtyp-Name. Es überschreibt Sulus eigene `single_icon_selection`-
Feldkomponente und den `icon`-Listenadapter an Ort und Stelle (siehe „Wie die Überschreibung funktioniert"
unten) und ergänzt die fehlende Twig-/PropertyResolver-Seite über Sulus eigene `icon_sets`-Konfiguration und
`IconProviderInterface`-Services.

---

## Einrichtung: ein Icon-Set registrieren (Sulu-Core-Konfiguration, nicht dieses Bundle)

```yaml
# config/packages/sulu_admin.yaml
sulu_admin:
    icon_sets:
        bootstrap-icons: 'svg://%kernel.project_dir%/var/icon-sets/bootstrap-icons'
```

Der Ordner enthält eine `.svg`-Datei pro Icon, z. B. aus dem `icons/`-Verzeichnis des npm-Pakets
`bootstrap-icons` (die gewünschten Dateien kopieren, `id` = Dateiname ohne `.svg`). Das vollständige
Konfigurationsformat (auch `icomoon://`) steht in [Sulus eigener
Doku](https://docs.sulu.io/en/latest/book/fields.html#single_icon_selection).

## Verwendung im Formular-XML

Genau Sulus eigene Syntax – nichts, was dieses Bundle ergänzt:

```xml
<property name="icon" type="single_icon_selection">
    <meta>
        <title lang="de">Icon</title>
        <title lang="en">Icon</title>
    </meta>
    <params>
        <param name="icon_set" value="bootstrap-icons"/>
    </params>
</property>
```

## Gespeicherter Wert

Ein reiner String, die Icon-Id (z. B. `"calendar-heart"`) – identisch zu Core. Dieses Bundle ist also eine
Drop-in-Verbesserung eines bestehenden `single_icon_selection`-Feldes, keine Migration.

## Formularfeld

Eine kompakte Zeile (Icon + Name, wie Sulus eigenes `single_media_selection`): ein Button links öffnet das
Auswahl-Overlay, der Papierkorb rechts entfernt die Auswahl. Das Vorschau-Icon wird einmal über Sulus eigenen
`GET /admin/api/icons`-Endpunkt geladen (denselben, den das Overlay nutzt) und zwischengespeichert.

## Auswahl-Overlay

Dasselbe Overlay, dieselbe Suche/Pagination/REST-Ladelogik wie Sulu-Core – nur die Icon-Kacheln sind durch ein
festes Raster ersetzt (Sulus eigene Kacheln brechen in eine Flex-Zeile mit unterschiedlicher Höhe um, was bei
ein paar tausend Icons unruhig aussieht).

## Twig

```twig
{{ sulu_icon(content.icon) }}
{{ sulu_icon(content.icon, {class: 'text-primary', size: 32, title: 'Termine'}) }}

{# fest im Template, z. B. als Ersatz für alte <i class="bi bi-calendar"></i> #}
{{ sulu_icon('calendar-heart', {icon_set: 'bootstrap-icons'}) }}
{{ sulu_icon('bootstrap-icons:calendar-heart') }}

{% if content.icon %}…{% endif %}                  {# Fallback, wenn nichts gesetzt ist #}
```

Der Property-Resolver liefert `{name, icon_set}` (oder `null`, wenn leer oder das Icon im Set nicht mehr
existiert) – `content.icon` in den Beispielen oben ist dieser aufgelöste Wert, nicht der gespeicherte rohe
String.

Ausgabe: das eigene SVG-Markup des Icons, mit überschriebenen `width`/`height`/`fill`/`class` und erhaltenem
`viewBox`, z. B.:

```html
<svg class="sulu-icon sulu-icon--bootstrap-icons text-primary" width="32" height="32" viewBox="0 0 16 16"
     fill="currentColor" role="img" aria-label="Termine">
    <path d="..."/>
</svg>
```

| Option     | Standard | Bedeutung                                                                    |
|------------|----------|--------------------------------------------------------------------------------|
| `class`    | –        | Zusätzliche CSS-Klassen                                                        |
| `size`     | `1em`    | `width`/`height`-Attribute; CSS-`width`/`height` überschreiben sie              |
| `title`    | –        | Barrierefreie Beschriftung (`role="img"`); ohne ist das Icon `aria-hidden`     |
| `icon_set` | –        | Nur bei einem reinen String-Wert ohne `pool:`-Präfix (fest verdrahtete Icons)   |

Die Farbe folgt `currentColor`. Ein unbekanntes Icon gibt nichts aus; mit `kernel.debug` wirft es stattdessen
einen Fehler, damit Tippfehler in Templates auffallen.

## Wie die Überschreibung funktioniert

Sulu-Core registriert `single_icon_selection` (Formularfeld) und `icon` (Listenadapter) selbst, im eigenen
`sulu_admin`-Update-Config-Hook, bevor der Hook dieses Bundles läuft – `fieldRegistry.add()`/
`listAdapterRegistry.add()` werfen bei einem bereits vergebenen Schlüssel einen Fehler, daher schreibt
`src/Resources/js/index.js` direkt in die internen `fields`/`adapters`-Maps der Registries und ersetzt Cores
Komponenten durch die dieses Bundles, nachdem Core sie bereits registriert hat. Keine Template-XML-Änderung und
kein neuer Feldtyp-Name nötig – bestehende `single_icon_selection`-Felder funktionieren weiter, sehen nur besser
aus.

## Installation

Siehe [README](../README.de.md#installation).
