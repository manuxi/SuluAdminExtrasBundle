# AddNewToolbarAction

Die `AddNewToolbarAction` ist eine benutzerdefinierte JavaScript-Toolbar-Aktion, die vom `SuluAdminExtrasBundle` bereitgestellt wird. Sie ermöglicht es, einen "Neu" Button zur Toolbar in Sulu Admin Edit- oder Settings-Formularen hinzuzufügen. Bei Klick wird der Benutzer direkt zur "Add" ("Hinzufügen") Route des jeweiligen Moduls weitergeleitet.

Dies ist besonders nützlich, um die Dateneingabe zu beschleunigen, da Benutzer fortlaufend neue Datensätze anlegen können, ohne zwischendurch in die Listenansicht zurückkehren zu müssen.

## Features

- Weiterleitung zu einer beliebigen angegebenen Route (meistens die `add_form` Route).
- Optionales Vorausfüllen des `date` Attributs mit dem tagesaktuellen Datum (nützlich für Kalendereinträge oder Termine).
- Beibehaltung der aktuell ausgewählten Sprache (`locale`) bei der Weiterleitung.

## Verwendung

Du kannst die `sulu_admin_extras.add_new` Toolbar-Aktion nativ in jeder deiner Admin PHP-Klassen nutzen, in denen ein Formular-View konfiguriert wird.

### Standardbeispiel (Ressourcen)

Füge die Aktion einfach in das Array `$toolbarActions` deines Form View Builders ein und gib die Zielroute an.

```php
use Sulu\Bundle\AdminBundle\Admin\View\ToolbarAction;

// ... innerhalb deiner Admin::configureViews() ...

$detailsToolbarActions = [
    new ToolbarAction('sulu_admin_extras.add_new', [
        'route' => static::ADD_FORM_VIEW
    ]),
    new ToolbarAction('sulu_admin.save'),
];
```

### Datum vorausfüllen (Termine)

Wenn deine "Hinzufügen"-Route einen `date` Parameter unterstützt (z.B. um das heutige Datum in einem Kalender oder Datepicker vorzuselektieren), kannst du die Option `'passDate' => true` verwenden.

```php
use Sulu\Bundle\AdminBundle\Admin\View\ToolbarAction;

// ... innerhalb deiner Admin::configureViews() ...

$detailsToolbarActions = [
    new ToolbarAction('sulu_admin_extras.add_new', [
        'route' => static::ADD_FORM_VIEW,
        'passDate' => true,
    ]),
    new ToolbarAction('sulu_admin.save'),
];
```

Bei Klick wechselt der Router dann in die `ADD_FORM_VIEW` Route und hängt automatisch die Parameter `&date=YYYY-MM-DD` sowie `&locale={aktuelle_sprache}` an die URL an.
