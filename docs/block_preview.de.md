# Block-Vorschau

Was Redakteure von einem **zugeklappten** Block in einem `block`-Feld sehen. Sulu zeigt nur Felder mit dem Tag
`sulu.block_preview` und kann nur Text-, Select-, Datums-, Smart-Content- und Medienfelder darstellen. Jedes andere
getaggte Feld wird stillschweigend ignoriert, sodass Blöcke rund um einen Kontakt, eine Organisation, ein Formular,
einen Link oder eine verschachtelte Liste zugeklappt leer wirkten.

Dieses Bundle ergänzt die fehlenden Darstellungen. Sie werden automatisch registriert; zu tun bleibt nur, das Feld
zu taggen:

```xml
<property name="contact" type="single_contact_selection">
    <meta><title>Person</title></meta>
    <tag name="sulu.block_preview" priority="1280"/>
</property>

<block name="boxes" default-type="types-box">
    <tag name="sulu.block_preview" priority="1280"/>
    <types>...</types>
</block>
```

Die Zeilen sind nach `priority` sortiert, höchste zuerst. Ein bewährtes Schema für ein einheitliches Bild über alle
Blöcke:

| Priorität | Inhalt |
|---|---|
| 2048 | Titel |
| 1536 | Untertitel |
| 1280 | das Besondere des Blocks (Auswahl, Link, verschachtelte Liste, ...) |
| 768 | Textauszug |
| 512 | Bild-Vorschau |

## Darstellungen

| Feldtyp | Zeigt |
|---|---|
| `single_account_selection`, `single_contact_selection`, `single_snippet_selection`, `single_form_selection` | `Organisation: Name` (Name wird bei Bedarf geladen und 30 s zwischengespeichert) |
| `account_selection`, `contact_account_selection`, `snippet_selection`, `page_selection`, `article_selection`, `event_selection`, `testimonial_selection`, `teaser_selection` | `Seiten: 3` |
| `block` (verschachtelt) | `Einträge: 3 · Titel A, Titel B, Titel C` (erstes `title`/`name`/`headline` jedes Eintrags) |
| `link` | Adresse bei externen Links, Art (Seite, Medium, ...) bei internen |

Bereits registrierte Schlüssel werden nie ersetzt; eine Darstellung aus dem Sulu-Core hat also immer Vorrang.

## Hinweise

- Ein getaggtes Feld erscheint nur, solange es einen Wert hat. Felder, die per `visibleCondition` ausgeblendet
  werden, nicht taggen: Sulu behält den Wert versteckter Felder, der zugeklappte Block würde veraltete Angaben zeigen.
- Die Vorschau sieht keine Nachbarfelder und kann daher z. B. „Art" und „Auswahl" nicht kombinieren.
- Beschriftungen lassen sich über die Übersetzungsschlüssel `sulu_admin_extras.block_preview_*` anpassen.
