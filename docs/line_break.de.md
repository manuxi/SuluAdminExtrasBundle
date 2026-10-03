# Line Break (Zeilenumbruch)

Der Content Type **Line Break** beginnt im Admin-Formular eine neue Zeile. Das Formular des Sulu-Admins ist ein 12-Spalten-Raster, dessen Felder nach links fließen: Ein Feld füllt die Zeile, bis sie voll ist. Eine Zeile vorzeitig zu beenden ging bisher nur mit `spaceAfter` am vorherigen Feld. Das scheitert, sobald dieses Feld oder das folgende per `visibleCondition` ausgeblendet ist: Der Abstand fehlt dann oder steht an der falschen Stelle.

Der Line Break hat keine Eingabe, kein Label und keine Höhe. Er sorgt nur dafür, dass die folgenden Felder in einer neuen Zeile beginnen. Er kann wie jedes andere Feld eine `visibleCondition` tragen, der Umbruch verschwindet also mit den Feldern, zu denen er gehört.

---

## Verwendung (Form-XML)

```xml
<property name="effect_break" type="line_break"
          visibleCondition="__parent.select_effect_source == 'custom'"/>
```

Die folgenden Felder beginnen in einer neuen Zeile, aber nur, solange die Bedingung erfüllt ist.

| Attribut           | Beschreibung |
|--------------------|--------------|
| `name`             | Beliebiger, eindeutiger Name. Es wird kein Wert gespeichert und nichts an die Website übergeben. |
| `visibleCondition` | Optional. Ohne Bedingung gilt der Umbruch immer. |

`meta` und `colspan` sind nicht nötig.

---

## Hinweise

- Vor einem Feld, das allein in einer Zeile steht, ist `spaceAfter` am vorherigen Feld weiterhin der einfachere Weg, wenn dieses Feld immer sichtbar ist.
- Mit dem Line Break bilden die Felder bis zum nächsten Umbruch eine Zeile, egal welche davon sichtbar sind.
- Das Feld markiert das Raster-Element, in dem es steht, mit einer CSS-Klasse (`clear: left`, Höhe 0). Das Sulu-Markup bleibt unangetastet.
