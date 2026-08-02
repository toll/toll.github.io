# toll.github.io
Kilden til Tolletatens offentlige API-sider på toll.github.io

HTML-sidene med tilhørende innholdspesifikke spesifikke media-filer ligger under `/api` (og `/api/media`).
Filen `/api/template.html` bør brukes som utgangspunkt for nye sider.

Styling ligger utrolig nok på `/style`.

Utgangspunktet for det som vises på https://toll.github.io er i `/index.html`. 

## llms.txt

`/llms.txt` er en maskinlesbar oversikt over dokumentasjonen. Filen genereres fra
HTML-sidene i repoet:

```sh
python3 scripts/generate_llms_txt.py
```

Bruk `python3 scripts/generate_llms_txt.py --check` for å kontrollere at den
genererte filen er oppdatert uten å skrive til arbeidsområdet.
