# Collapsible Sections

This UI hack enables regular Sulu sections in the admin backend (`<section>`) to become collapsible. This is particularly useful in complex forms with numerous properties.

No specialized custom form type is required. Instead, any section whose title (`<title>`) matches a predetermined list in the bundle configuration will automatically morph into a collapsible UI block.

## How it works

Since the Sulu React frontend ignores the `cssClass` attribute from XML section definitions, this bundle employs a **Mutation Observer**. It continuously scans the DOM for section labels. 
When a matching title is detected, it injects the necessary CSS classes (`sulu-collapsible-section`) to render an eye icon and enable the hide/show transition functionality for its container field grid.

## Configuration (sulu_admin_extras.yaml)

In your project configuration (`config/packages/sulu_admin_extras.yaml`), define an array containing the exact section titles you want to become collapsible. Case sensitivity applies, while leading or trailing spaces are trimmed. Also translation strings are supported.

```yaml
sulu_admin_extras:
    collapsible_sections:
        - 'sulu_appointment.section_customer'
        - 'sulu_appointment.section_content' # Add your custom english titles here
```

## Usage in XML forms

Simply utilize the standard `.xml` syntax for Sulu sections. The only prerequisite is that the text inside the `<title>` element exactly matches one of the labels defined in the configuration array:

```xml
        <section name="description_notes">
            <meta>
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
