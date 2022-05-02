# Dokumentasjon av eksternt grensesnitt: API for Kjøretøy på vei

## Innhold

-   [Om tjenesten](#omtjenesten)

-   [Data](#data)

    -   [Dataelementer knyttet til transport](#dtransport)

    -   [Dataelementer knyttet til forsendelse](#dforsendelse)

    -   [Dataelementer knyttet til vare](#dvare)

-   [Melding om transport](#mtransport)

-   [Melding om forsendelse](#mforsendelse)

-   [Aktuelle eksempler](#eksempler)

-   [Autentisering -- Datautveksling mellom næringslivet og Tolletaten](#aut)

    -   [Hvordan komme i gang med Maskinporten?](#maskinporten)

## Om tjenesten <a id="omtjenesten"></a>

API-et støtter innsending av opplysninger knyttet til melde og
opplysningsplikten for kjøretøy på vei og ferge i henhold til forskrift
om inn- og utførsel av varer, § 2-3. API-et er delt i 2 forskjellige
meldinger, en for innsending av opplysninger knyttet til transport og en
for innsending av opplysninger knyttet til forsendelser. Meldingene
sendes inn hver for seg og uavhengig av hverandre med tanke på både
rekkefølge og avsender. Melding om transport skal inneholde en liste med
sporingsnummer til alle forsendelsene som skal være med på transporten.
Forsendelse knyttes til transport ved hjelp av at sporingsnummeret også
oppgis i melding om forsendelse.

For å kunne bruke tjenesten må scope for autentisering mot Maskinporten
settes til **toll: movement.road.api/**

![](media/kpv-transp_last.jpg)

_Figur: Illustrasjonen viser på et overordnet nivå hvilken informasjon
knyttet til transport og last som skal sendes inn._

![](media/kpv-digiflyt.png)

_Figur: Tjenesten støtter opp under Tolletatens konsept for digital og
automatisert vareførsel over grensen_

## Data <a id="data"></a>

Tabellene under gir en oversikt over sentrale dataelementer knyttet til
transport og vare. De detaljerte informasjonsmodellene for transport og
forsendelse vil publiseres så snart de er klare. Det er også synliggjort
hvilke dataelementer som vil inngå i NCTS fase 5 og hvorvidt de vil være
obligatoriske, betingede eller frivillige der.

### Dataelementer knyttet til transport <a id="dtransport"></a>

| **DATAELEMENT**            |  **OBLIGATORISK**  |  **BETINGET**   | **FRIVILLIG**   | **NCTS5** |
| -------------------------- |  ----------------- | --------------- | --------------- | -------- |
| **AVSENDER**               |                    |  **X**          |                 | **B**    |
| **MOTTAKER**               |                    |  **X**          |                 | **B**    |
| **TRANSPORTØR**            |  **X**             |                 |                 | **O**    |
| **ANDRE AEO-ER**           |                    |                 | **X**           | **O**    |
| **FRAKTBREV**              |  **X**             |                 |                 | **F**    |
| **SAMLET BRUTTOVEKT**      |  **X**             |                 |                 | **O**    |
| **AKTIVT TRANSPORTMIDDEL** |  **X**             |                 |                 | **B**    |
| **FØRER**                  |  **X**             |                 |                 | **-**    |
| **TRANSPORTUTSTYR**        |                    |  **X**          |                 | **B**    |
| **TOLLSTED/TID FOR ANKOMST** |  **X**           |                 |                 | **-**    |
| **REISERUTE**              |                    |  **X**          |                 | **B**    |
| **PASSIVT TRANSPORTMIDDEL** |                   |                 | **X**           | **-**    |
| **MANNSKAP**               |                    |                 | **X**           | **-**    |
| **LASTESTED**              |                    |                 | **X**           | **F**    |
| **LOSSESTED**              |                    |  **X**          |                 | **O**    |


### Dataelementer knyttet til forsendelse <a id="dforsendelse"></a>

| **DATAELEMENT**            |  **OBLIGATORISK**   |  **BETINGET**   |  **FRIVILLIG**   |  **NCTS 5** |
| -------------------------- |  ------------------ |  -------------- |  --------------- |  --------|
| **AVSENDER**               |                     |  **X**          |                  |  **B**   |
| **MOTTAKER**               |                     |  **X**          |                  |  **B**   |
| **ANDRE AEO-ER**           |                     |                 |  **X**           |  **O**   |
| **FRAKTBREV**              |  **X**              |                 |                  |  **O**   |
| **RELEVANTE DOKUMENTER**   |                     |  **X**          |                  |  **O**   |
| **FRAKTKOSTNADER**         |  **X**              |                 |                  |  **O**   |
| **SAMLET FAKTURERT VERDI** |  **X**              |                 |                  |  **-**   |
| **BRUTTOVEKT**             |  **X**              |                 |                  |  **O**   |
| **PASSIVT TRANSPORTMIDDEL** |                    |                 |  **X**           |  **-**   |
| **TRANSPORTUTSTYR**        |                     |                 |  **X**           |  **-**   |
| **LASTESTED**              |                     |                 |  **X**           |  **-**   |
| **LOSSESTED**              |                     |  **X**          |                  |  **-**   |
| **REISERUTE**              |                     |  **X**          |                  |  **-**   |

### Dataelementer knyttet til vare <a id="dvare"></a>

| **DATAELEMENT**             | **OBLIGATORISK**   |  **BETINGET**   |  **FRIVILLIG**   |  **NCTS5** |
| --------------------------- | ------------------ |  -------------- |  --------------- |  -------- |
| **ANDRE AOE-ER**            |                    |                 |  **X**           |  **O**    |
| **RELEVANTE DOKUMENTER**    |                    |  **X**          |                  |  **O**    |
| **FAKTURERT VERDI**         | **X**              |                 |                  |  **-**    |
| **VAREBESKRIVELSE OG NUMMER** | **X**            |                 |                  |  **X**    |
| **BRUTTO- OG NETTOVEKT**    | **X**              |                 |                  |  **F+B**  |
| **EMBALLASJE OG ANTALL KOLLI** |                 |                 |  **X**           |  **O+B**  |
| **OPPRINNELSESLAND**        | **X**              |                 |                  |  **-**    |
| **PASSIVT TRANSPORTMIDDEL** |                    |                 |  **X**           |  **-**    |
| **TRANSPORTUTSTYR**         |                    |                 |  **X**           |  **-**    |
| **FARLIG GODS**             |                    |                 |  **X**           |  **X**    |

## Melding om transport <a id="mtransport"></a>

Oppsummering av innhold

|  **Område**         |  **Beskrivelse** |
| ------------------- | ---------------- |
|  Melde transport    |  Informasjon om transport og referanse til alle forsendelsene om bord i transporten |
|  Avgiver av informasjon |  Speditør/Transportør/Vareeier/Fullmektig |
|  Mottaker av informasjon |  Tolletaten |
|  Er informasjon obligatorisk?     |  Ja |
|  Når ønskes informasjon hos Tolletaten? |  Så tidlig som mulig, dog senest ved grensepassering for transport |
|  Når ønskes oppdatering av informasjonen? | Informasjon må oppdateres når viktige deler av informasjonen endres. Typisk ved endring av kjennemerker, sjåfør, tid/sted for grensepassering, ved endringer i listen av forsendelser (flere forsendelser/færre forsendelser enn i foregående melding) |
|  Frist for innsending |  Senest ved grensepassering |
|  Viktige informasjonselementer |  Kjennemerke(r) på aktivt og passivt transportmiddel, informasjon om fører, tid/sted for grensepassering, sporingsnummer til alle forsendelsene i transporten |
|  Spesielt om oppdatering av melding om transport | Ved oppdatering og kansellering er MRN mottatt i opprinnelig melding den nøkkelen som skal brukes for å identifisere riktig transport |


## Melding om forsendelse <a id="mforsendelse"></a>

Oppsummering av innhold

|  **Område**           | **Beskrivelse**                               |
| ----------------------|-----------------------------------------------|
|  Melde forsendelse    | Informasjon om forsendelse.                   |
|  Avgiver av informasjon | Speditør/Transportør/Vareeier/Fullmektig      |
|  Mottaker av informasjon | Tolletaten |
|  Er informasjon obligatorisk?       | Ja |
|  Når ønskes informasjon hos Tolletaten? | Så tidlig som mulig, dog senest ved grensepassering for forsendelse |
|  Når ønskes oppdatering av informasjonen? | Informasjon ønsker oppdatert  når viktige deler av informasjonen endres |
|  Frist for innsending | Senest ved grensepassering                    |
|  Viktige informasjonselementer | Sporingsnummer, Tollprosedyre, Referanse til import og eksport deklarasjoner, Referanse til NCTS transittering(er), Varebeskrivelser/vekt/verdi, Avsender, Mottaker |
| Spesielt om oppdatering av melding om transport | Ved oppdatering og kansellering er MRN mottatt i opprinnelig melding nøkkelen som skal brukes for å identifisere riktig forsendelse. |

## Grensesnittbeskrivelse <a id="grensesnitt"></a>

Tjenestene vil gjøres tilgjengelige som REST-tjenester over HTTP, med data på JSON-format.


## Aktuelle eksempler <a id="miljo"></a>

-   Forsendelse direktefortolling med prosedyre ut av EU = eksport

    -   Eksempelet viser en forsendelse som skal direktefortolles på
        grensen og hvor prosedyren ut av EU er en svensk eksport av
        typen UGE. Under ImportProcedure ligger deklarasjonsId\'en til
        den allerede innsendte fortollingen i TVINN. Under ExportFormEU
        ligger eksporttype, her en UGE, og i feltet ExportId legges
        MRN-en til den ferdigekspederte eksporten.

-   Forsendelse transittering som kun skal grensepasseres i NCTS

    -   Eksempelet viser en forsendelse som er under transittering og
        som skal fullføres ved ankomst til bestemmelsessted. Her skal
        PreviousDocuments fylles ut med TypeOfReference = N820 og i
        feltet Reference fyller man ut MR-\'en til transitteringen fra
        NCTS

-   Oppdatere transport

    -   Eksempelet viser en oppdatert melding om transport. Den
        opprinnelige meldingen inneholdt en liste med 2 forsendelser og
        den oppdaterte meldingen inneholder en liste med de samme 2
        forsendelsene pluss en ny forsendelse, til sammen 3 forsendelser

## Autentisering -- Datautveksling mellom næringslivet og Tolletaten <a id="aut"></a>

Maskinporten og Altinn er nasjonale felleskomponenter utviklet og
driftet av Digitaliseringsdirektoratet som sammen skal gjøre det enklere
å dele og bruke data på tvers av systemer. Løsningene sørger for
verifisering av identiteten til virksomheter og gi disse riktig tilgang
til data som offentlige virksomheter tilbyr via grensesnitt.

**Maskinporten:** Løsning for tilgangsstyring for virksomheter som
utveksler data. Garanterer identitet mellom virksomheter og sørger for
maskin-til-maskin autentisering.

**Fremtidig mulighet, men ikke innført: Altinn (autorisasjon):**
Mulighet for delegering av rettigheter til andre organisasjoner eller
personer. Baserer seg på registrerte roller i Enhetsregisteret.

Forutsetninger for å benytte Maskinporten og Altinn:

-   Organisasjonen er registrert i Enhetsregisteret med norsk
    organisasjonsnummer

Virksomhetsautorisering og tilgangsstyring i forbindelse med innsending
av informasjon via API gjøres gjennom Maskinporten hos
Digitaliseringsdirektoratet. Maskinporten sørger for sikker
autentisering og tilgangskontroll for datautveksling mellom
virksomheter. Løsningen garanterer identiteten mellom virksomheter og
gjør det mulig å binde sammen systemer og utvikle nye tjenester på en
effektiv måte. Løsningen skal ha en oppetid på 99,9% og ved avvik har
den sjelden nedetid på lengre enn 5 minutter. Vi anbefaler derfor at
våre klienter implementerer en retry-mekanisme slik at man prøver på
nytt dersom meldinger blir avvist uten forklarlige feilmeldinger.

-   Vi anbefaler våre klienter å følge med på planlagt og ikke-planlagt
    driftsavvik

    -   [Digitaliseringsdirektoratet Status - Historikk (digdir.no)](https://status.digdir.no/history?filter=nthvr1xysxs7)

Det er også mulig å verifisere om Maskinporten er oppe ved å benytte
linkene under:

-   <https://oidc.difi.no/idporten-oidc-provider/health>

-   <https://maskinporten.no/health>

Maskinporten har også laget en side med feilsøkingsforslag
på <https://difi.github.io/felleslosninger/maskinporten_feilsoking.html>.

#### Hvordan komme i gang med Maskinporten? <a id="maskinporten"></a>

-   Tolletatens guide for oppsett av Maskinporten: [Maskinporten - Tolletaten](https://www.toll.no/no/bedrift/ekspressklarering/teknisk-informasjon/endringer-ustabilitet-feilmeldinger/autentisering-og-tilgang/maskin-til-maskin/)

-   Digitaliseringsdirektoratets guide for hvordan kommer i gang med
    Maskinporten: <https://samarbeid.difi.no/felleslosninger/maskinporten/ta-i-bruk-maskinporten/1-planlegge-og-akseptere-bruksvilkar>

Når virksomheten har gått gjennom søknadsprosessen
til Digitaliseringsdirektoratet vil Tolletaten godkjenne og gi tilgang til grensesnitt/scopes.


Dersom man benytter en (system)leverandør for å utveksle informasjon med
Tolletaten må rettigheter delegeres via Altinn: <https://www.altinn.no/hjelp/profil/roller-og-rettigheter/hvordan-gi-rettigheter-til-andre/>.

Om du ønsker å finne ut hva rollene gir tilgang til, logg inn
i Altinn og se under *Skjema og tjenester du har rettighet til*, der får
du oversikt over rollene du har for den aktøren du representerer. Til
høyre for hver rolle finner du et spørsmålstegn, klikk der og du vil se hvilke tilganger rollen gir deg. 