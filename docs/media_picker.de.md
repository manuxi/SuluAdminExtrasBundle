# Media Picker

Ein Formularfeld, das ein großes Bildvorschau zeigt und beim Klick darauf ein Overlay öffnet, in dem sich sowohl
ein bereits in der Mediathek vorhandenes Bild auswählen als auch ein neues hochladen lässt — beides an derselben
Stelle. Ersetzt `single_media_upload`: Das kann nur hochladen und zeigt **keine** Vorschau, wenn ein Artikel/eine
Seite mit bereits gesetztem Bild erneut geöffnet wird (das Formular liefert dem Feld nur `{"id": n}`, das Feld
selbst holt sich die vollständigen Bilddaten aber nie nach). Ersetzt außerdem `single_media_selection`, dessen
25×25px kleines Vorschaubildchen kaum erkennen lässt, welches Bild ausgewählt ist.

---

## Verwendung im Formular-XML

```xml
<property name="image" type="media_picker">
    <meta>
        <title lang="de">Bild</title>
    </meta>
    <params>
        <!-- optional, wie bei single_media_selection -->
        <param name="types" type="collection">
            <param name="image"/>
        </param>
        <!-- optional: welches Thumbnail-Format geladen wird, Standard "sulu-400x400" -->
        <param name="image_size" value="sulu-400x400"/>
        <!-- optional: Icon im leeren Platzhalter, Standard "su-image" -->
        <param name="empty_icon" value="su-image"/>
        <!-- optional: Ordner, in dem das Auswahl-Overlay startet (System-Collection empfohlen) -->
        <param name="collection_id"
               type="expression"
               value="service('sulu_media.system_collections.manager').getSystemCollection('ihr_webspace.articles')"/>
    </params>
</property>
```

## Gespeicherter Wert

`{"id": <mediaId>, "displayOption": null}` — dieselbe Form wie bei `single_media_selection`. Bestehende Inhalte
funktionieren nach dem Wechsel des `type`-Attributs auf `media_picker` unverändert weiter (und umgekehrt).

## Verhalten

Gestaltet wie Sulus eigenes `single_media_upload` (`SingleMediaDropzone`): quadratische Vorschau mit durchgezogenem
Rahmen, weißem Hintergrund und großem, zentriertem Icon, wenn nichts ausgewählt ist — keine gepunktete
"Dropzone"-Optik. Download/Entfernen stehen als Textlinks unter der Vorschau, nicht als Icon über dem Bild.

- Lädt das Bild selbst über die ID nach (`SingleSelectionStore`), zeigt daher immer eine korrekte Vorschau, auch
  direkt nach dem erneuten Öffnen eines gespeicherten Artikels — anders als `single_media_upload`.
- Vorschau ist ein quadratisches Bild (Format konfigurierbar über `image_size`, Standard `sulu-400x400`), keine
  25×25px-Zeilen-Miniatur.
- Klick auf die Vorschau öffnet Sulus Medien-Overlay (Durchsuchen der Mediathek inkl. Ordnerstruktur oder
  Hochladen einer neuen Datei) — ohne eigenes zusätzliches Bedienelement. Mit `collection_id` startet das Overlay
  direkt im gewünschten Ordner (z. B. eine System-Collection), statt in der Wurzel der gesamten Mediathek.
- Sobald ein Medium gewählt ist, erscheinen "Herunterladen" und "Entfernen" als Textlinks unter der Vorschau
  (Sulus eigene Übersetzungen `sulu_media.download_media`/`delete_media`); Entfernen fragt vorher nach, genau wie
  bei `single_media_upload`.

## Voraussetzungen

Braucht `sulu-media-bundle` als Geschwister-npm-Paket im Projekt (ist immer schon der Fall, wenn dort auch
`single_media_selection`/`single_media_upload` genutzt werden, da beide aus demselben MediaBundle stammen).

## Installation

Wie bei den anderen eigenen Feldtypen dieses Bundles: `fieldRegistry` ist bereits in `index.js` verdrahtet, danach
im Projekt unter `assets/admin`:

```bash
rm -rf node_modules/sulu-admin-extras-bundle
npm install --force
npm run build
```
