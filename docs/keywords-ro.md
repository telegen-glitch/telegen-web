# Romanian keyword map (one primary intent per URL)

**Status: research NOT DONE.** The data sources were unavailable on 2026-10-06:
Google autocomplete / SERPs and the top-ranking Romanian pages are blocked by this environment's
network policy, and the Semrush connector reports insufficient API units. The intents below are the
planned mapping from the IA in CLAUDE.md §7c.B, to be validated (volumes, PAA questions, related
searches, competing pages) and adjusted before any page is published. Merge a URL into its hub if
research shows it has no distinct intent (no thin pages).

| URL                                   | Primary intent (hypothesis)         | Candidate cluster (to validate)                                                   |
| ------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| /acnee                                | understand acne + get help          | acnee, acnee tratament, coșuri pe față                                            |
| /acnee/tipuri                         | identify my type                    | tipuri de acnee, acnee chistică, acnee hormonală, acnee la adulți                 |
| /acnee/cauze                          | why it happens                      | cauze acnee, de ce apare acneea, acnee de la ce                                   |
| /acnee/tratament                      | what treats it, stepwise            | tratament acnee, cremă pentru acnee, tratament acnee severă                       |
| /acnee/cicatrici                      | scars                               | cicatrici acnee, urme acnee, cum scap de cicatricile de acnee                     |
| /disfunctie-erectila                  | understand ED + get help discreetly | disfuncție erectilă, impotență, probleme de erecție                               |
| /disfunctie-erectila/cauze            | why it happens                      | cauze disfuncție erectilă, disfuncție erectilă la tineri                          |
| /disfunctie-erectila/tratament        | treatment options                   | tratament disfuncție erectilă, tratament natural impotență (intent check)         |
| /disfunctie-erectila/sanatatea-inimii | ED and heart                        | disfuncție erectilă și inima, disfuncție erectilă boli cardiovasculare            |
| /tratamente/{medicine}                | neutral medicine information        | "{substanță} ce este", "{substanță} efecte adverse" (no purchase intent targeted) |

Rules: no page targets purchase intent for a prescription medicine (§9.4); ED pages avoid
performance and size terms (§7c.C).
