# DateTime With Default

A date-time picker that supports a configurable default value via `schemaOptions`. Unlike Sulu's built-in `date` field type, this field properly applies `default_value` on initial load, solving the known limitation where Sulu's DatePicker ignores `default_value` params.

---

## Usage in XML Forms

```xml
<property name="publishDate" type="datetime_with_default" colspan="6">
    <meta>
        <title lang="de">Veröffentlichungsdatum</title>
        <title lang="en">Publish Date</title>
    </meta>
    <params>
        <param name="default_value"
               type="expression"
               value="service('my_service').getDefaultDate()"/>
    </params>
</property>
```

### Static Default Value

```xml
<property name="eventDate" type="datetime_with_default" colspan="6">
    <meta>
        <title lang="de">Datum</title>
        <title lang="en">Date</title>
    </meta>
    <params>
        <param name="default_value" value="2026-01-01T10:00:00"/>
    </params>
</property>
```

---

## Features

- **Default value support**: Applies `default_value` from `schemaOptions` on `componentDidMount` when no value is stored
- **Expression support**: Works with Sulu's `type="expression"` params to call PHP services for dynamic defaults
- **Sulu DatePicker**: Uses Sulu's native `DatePicker` component with `dateFormat: true` and `timeFormat: true`
- **ISO format**: Stores values as `YYYY-MM-DDTHH:mm:ss`

---

## How It Works

On mount, the component checks:

1. If the field has no stored value (`!value`)
2. And a `default_value` exists in `schemaOptions`
3. Then it calls `onChange(defaultValue)` to pre-fill the field

The DatePicker displays either the stored value or the default value as fallback.

---

## Schema Options

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `default_value` | `string` | — | Default datetime in `YYYY-MM-DDTHH:mm:ss` format. Supports `type="expression"` for dynamic values. |

---

## Data Format

```
2026-03-15T14:30:00
```

Format: `YYYY-MM-DDTHH:mm:ss`

---

## Components

| File | Description |
|------|-------------|
| `DateTimeWithDefault.js` | Standalone component (does not extend AbstractDateTime) |