# Publish State Indicator

The **Publish State Indicator** is a List Transformer that displays the workflow status of an entity (e.g., Draft vs. Published) using a colored dot.

---

## Usage (List XML)

It typically connects to a property like `publishedState`.

```xml
<property name="publishedState" translation="sulu_admin.state" visibility="yes">
    <transformer type="publish_state_indicator"/>
</property>
```

---

## Parameters

This transformer does not accept XML parameters.

## Customization

The colors and logic are generally handled internally to match Sulu's standard UI (Yellow for Draft, Green for Published).
