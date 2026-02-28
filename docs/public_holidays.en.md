# Public Holidays

An interactive holiday manager that fetches public holidays from the [Nager.Date API](https://date.nager.at/) with country and region filtering. Users can enable/disable individual holidays, add custom entries, and select by year.

![publicHolidays](img/publicHolidays.de.png)

---

## Usage in XML Forms

```xml
<property name="publicHolidays" type="public_holidays" colspan="12">
    <meta>
        <title lang="de">Feiertage</title>
        <title lang="en">Holidays</title>
    </meta>
</property>
```

---

## Features

- **Country & region selection**: Sulu SingleSelect for country and optional subdivision (e.g. NRW, Bayern)
- **Year selection**: Current year ±1, with option to go +2 years ahead
- **API integration**: Fetches holidays from Nager.Date API via a server-side proxy with 24h cache
- **Checkbox per holiday**: Enable/disable individual holidays using Sulu Checkbox
- **Custom holidays**: Add custom entries with Sulu DatePicker and free-text name
- **Counter**: Shows active/total count in the footer
- **Translations**: All labels use `translate()` via `admin.de.yaml` / `admin.en.yaml`

---

## Data Structure (JSON)

```json
{
    "country": "DE",
    "subdivision": "DE-NW",
    "year": 2026,
    "holidays": [
        {
            "date": "2026-01-01",
            "localName": "Neujahr",
            "name": "New Year's Day",
            "enabled": true,
            "custom": false
        },
        {
            "date": "2026-02-11",
            "localName": "Team Day",
            "name": "Team Day",
            "enabled": true,
            "custom": true
        }
    ]
}
```

| Key | Type | Description |
|-----|------|-------------|
| `country` | `string` | ISO country code (e.g. `DE`, `AT`, `CH`) |
| `subdivision` | `string\|null` | Regional code (e.g. `DE-NW` for NRW) or `null` for all |
| `year` | `integer` | Selected year |
| `holidays` | `array` | Array of holiday objects |
| `holidays[].date` | `string` | Date in `YYYY-MM-DD` format |
| `holidays[].localName` | `string` | Local name of the holiday |
| `holidays[].name` | `string` | International (English) name |
| `holidays[].enabled` | `boolean` | Whether this holiday is active |
| `holidays[].custom` | `boolean` | Whether this was manually added |

---

## Server-Side Components

### PublicHolidayProxyController

Provides three API endpoints for the frontend:

| Route | Method | Description |
|-------|--------|-------------|
| `/admin/api/public-holidays/countries` | GET | Available countries |
| `/admin/api/public-holidays/subdivisions/{code}` | GET | Subdivisions for a country |
| `/admin/api/public-holidays/fetch?country=DE&year=2026` | GET | Holidays for country/year |

### PublicHolidayService

Symfony service that wraps the Nager.Date API with caching:

- Fetches from `https://date.nager.at/api/v3/`
- Caches responses for 24 hours (countries for 7 days, subdivisions for 30 days)
- Filters by subdivision when provided
- **Optional country filtering** via `$allowedCountries` parameter

---

## Country Filtering

To limit the country dropdown, configure the service in `services.yaml`:

```yaml
Manuxi\SuluAdminExtrasBundle\Service\PublicHolidayService:
    arguments:
        $httpClient: '@http_client'
        $cache: '@cache.app'
        $logger: '@?logger'
        $allowedCountries: ['DE', 'AT', 'CH', 'FR', 'NL', 'BE', 'LU', 'PL', 'CZ', 'DK']
```

Set to `[]` (empty array) to show all 100+ countries.

---

## PHP Access

```php
$publicHolidays = $settings->getPublicHolidays();

// Check if a date is a public holiday
$dateStr = '2026-01-01';
$holidays = $publicHolidays['holidays'] ?? [];
foreach ($holidays as $holiday) {
    if ($holiday['enabled'] && $holiday['date'] === $dateStr) {
        // This is a non-working day
    }
}
```

---

## Components

| File | Description |
|------|-------------|
| `PublicHolidays.js` | FieldType wrapper |
| `PublicHolidaysEditor.js` | Interactive editor with API integration |
| `PublicHolidays.scss` | Styles (Sulu color variables) |
| `PublicHolidaysPropertyResolver.php` | Content API resolver |
| `PublicHolidayService.php` | Nager.Date API client with caching |
| `PublicHolidayProxyController.php` | Admin API proxy endpoints |