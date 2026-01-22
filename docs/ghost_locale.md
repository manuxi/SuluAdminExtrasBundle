# Ghost Locale Indicator

The **Ghost Locale Indicator** is a List Transformer that helps visualize if content exists in the current language or if it is a "ghost" (fallback from another language).

---

## Usage (List XML)

```xml
<property name="ghostLocale" translation="sulu_admin.ghost_locale" visibility="yes">
    <transformer type="ghost_locale_indicator"/>
</property>
```

This is often used in combination with the standard `ghost_locale` property provided by Sulu's persistence logic.

---

## Parameters

This transformer does not accept XML parameters.
