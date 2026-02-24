# Collapsible Sections

Dieser UI-Hack ermöglicht es, reguläre Sulu-Sektionen im Admin-Backend (`<section>`) auf- und zuklappbar zu machen. Dies spart Platz in Formularen mit vielen Feldern.

Es ist kein spezieller Form-Type notwendig; es reicht, wenn die Sektion einen bestimmten Namen/Titel über `<title>` erhält, der in der Bundle-Konfiguration hinterlegt ist.

## Funktionsweise
Da Sulu in seinem React-Frontend für Formular-Sektionen das `cssClass` Attribut aus der XML-Definition ignoriert, nutzt dieses Bundle einen *Mutation Observer*, der das DOM nach Sektionstiteln durchsucht. 
Wenn ein bekannter Titel gefunden wird, werden automatisch die benötigten CSS-Klassen (`sulu-collapsible-section`) injiziert, was ein Auge-Icon hinzufügt und den Inhalt ein-/ausklappbar macht.

## Konfiguration (sulu_admin_extras.yaml)

In der Konfiguration des Projekts (`config/packages/sulu_admin_extras.yaml`) wird ein Array an Sektions-Titeln definiert. Jede Sektion, die exakt so benannt ist (Groß-/Kleinschreibung wird beachtet, Leerzeichen am Rand werden ignoriert), wird automatisch einklappbar.
Dabei werden auch übersetzungsstring unterstützt, um möglichst hohe Flexibilität zu gewährleisten.

```yaml
sulu_admin_extras:
    collapsible_sections:
        - 'sulu_appointment.section_customer'
        - 'sulu_appointment.section_content'
```

## Verwendung in XML Formularen

Verwenden Sie eine ganz normale Sulu `section`. Wichtig ist nur, dass der Text innerhalb des `<title>`-Tags mit einem der Einträge in der Konfiguration übereinstimmt:

```xml
<section name="description_notes">
    <meta>
        <!-- Title wird gematcht -->
        <title>sulu_appointment.section_content</title>
    </meta>
    <properties>
        <property name="description" type="text_area" colspan="12">
            <meta>
                <title>sulu_appointment.description</title>
            </meta>
        </property>
    </properties>
</section>
```
