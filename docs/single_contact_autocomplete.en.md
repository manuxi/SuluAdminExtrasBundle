# Single Contact Autocomplete

An autocomplete field for selecting a single contact (or other resource). It provides search functionality with dropdown suggestions, an overlay for detailed list selection, and a quick-create feature for new contacts.

![single_contact_autocomplete](img/single_contact_autocomplete.suggestions.de.png)

---

## Usage in XML Forms

```xml
<property name="contact" type="single_contact_autocomplete" colspan="6">
    <meta>
        <title lang="de">Kontakt</title>
        <title lang="en">Contact</title>
    </meta>
    <params>
        <param name="resource_key" value="contacts"/>
        <param name="display_property" value="fullName"/>
    </params>
</property>
```

---

## Features

- **Autocomplete Search**: Starts searching via the API after 3 characters (`searchStore`). Matches are displayed in a popover, highlighting the search query dynamically in the name, email, and phone fields.
- **List Selection (SingleListOverlay)**: Clicking the user icon (![User-Icon](img/single_contact_autocomplete.user_icon.png)) in the input field opens a modal overlay showing the complete paginated list for the specified resource_key.
- **Quick-Create**: If there are no results a link to add a new contact is shown. If this or the "+" button is clicked, a small overlay opens to quickly create a new contact (First Name, Last Name, Phone, Email). The current search query is smartly split into first and last name automatically.
- **Clear**: If a contact is already selected or t3ext is entered, it can be cleared using the "X" symbol in the input field.

---

## Schema Options

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `resource_key` | `string` | `'contacts'` | Sulu resource key used for searching, selecting, and saving |
| `display_property` | `string` | `'fullName'` | Property to display as the name of the selected contact in the suggestion list |
| `search_properties` | `collection` | `['firstName', 'lastName', 'mainEmail', 'mainPhone']` | Properties sent to the internal API search mechanism as search filters |

---

## Data Format

The field stores the ID of the selected resource.

```json
123
```

Format: `integer` (Contact ID)

---

## Components

| File | Description |
|-------|-------------|
| `SingleContactAutocomplete.js` | The React component integrating Input, Popover, Overlay (for quick-create form), and SingleListOverlay |

## Search for mainPhone

In order for the search for the telephone number (mainPhone) to work, a file `config/lists/contacts.xml` must be stored in the project with the following content:
```xml
<?xml version="1.0" ?>
<list xmlns="http://schemas.sulu.io/list-builder/list">
    <key>contacts</key>
    <properties>
        <property name="mainPhone" visibility="always" searchability="yes" translation="sulu_contact.phone">
            <field-name>mainPhone</field-name>
            <entity-name>%sulu.model.contact.class%</entity-name>
        </property>
    </properties>
</list>
```

This file is merged with the original one from Sulu and, with `searchability=‘yes’`, ensures that the contact can be found via the telephone number.