# AddNewToolbarAction

The `AddNewToolbarAction` is a custom JavaScript toolbar action provided by the `SuluAdminExtrasBundle`. It allows you to add a "New" (or "Add") button to the toolbar of Sulu Admin Edit/Settings forms, which instantly redirects the user to the "Add" route of the current module.

This is particularly useful to increase data entry speed, allowing users to create consecutive records without needing to go back to the list view first.

![AddNewToolbarAction](img/add_new_toolbar_action.de.png)

## Features

- Redirects to any specified route (usually the `add_form` route).
- Optionally pre-fills the `date` attribute with the current day (useful for calendar events or appointments).
- Preserves the current locale during the redirect.

## Usage

You can use the `sulu_admin_extras.add_new` toolbar action natively in any of your Admin PHP classes where a form view is built.

### Basic Example (Resources)

Add the action to your Form View Builder's `$toolbarActions` array and provide the target route.

```php
use Sulu\Bundle\AdminBundle\Admin\View\ToolbarAction;

// ... inside your Admin::configureViews() ...

$detailsToolbarActions = [
    new ToolbarAction('sulu_admin_extras.add_new', [
        'route' => static::ADD_FORM_VIEW
    ]),
    new ToolbarAction('sulu_admin.save'),
];
```

### Pre-filling the Date (Appointments)

If your "Add" route supports a `date` parameter (for example, to pre-select today's date in a calendar or a date-picker), you can pass `'passDate' => true` to the action options.

```php
use Sulu\Bundle\AdminBundle\Admin\View\ToolbarAction;

// ... inside your Admin::configureViews() ...

$detailsToolbarActions = [
    new ToolbarAction('sulu_admin_extras.add_new', [
        'route' => static::ADD_FORM_VIEW,
        'passDate' => true,
    ]),
    new ToolbarAction('sulu_admin.save'),
];
```

When clicked, the router will transition to the `ADD_FORM_VIEW` route, appending `&date=YYYY-MM-DD` and `&locale={current_locale}` to the URL parameters.
