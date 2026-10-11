# Legal drafts (v5 clinical flow)

**DRAFT FOR LAWYER.** Every document in this folder is a technical draft by the build team, written so the
owner's lawyer can review, correct and sign it off. None of it is legal advice and none of it is final.
The public terms and privacy pages are TEMPORARY until the same sign-off (docs/legal-review-needed.md #35).

| File                                         | What it is                                                |
| -------------------------------------------- | --------------------------------------------------------- |
| [dpia.md](dpia.md)                           | Data protection impact assessment (GDPR art. 35)          |
| [art30-record.md](art30-record.md)           | Record of processing activities (GDPR art. 30)            |
| [processors.md](processors.md)               | Processors and recipients, with what each one receives    |
| [retention.md](retention.md)                 | Retention per data category, and what the code does today |
| [incident-response.md](incident-response.md) | Personal data breach procedure (GDPR arts. 33–34)         |

Facts in these drafts come from the code in this repo (`supabase/migrations/`, `src/clinical/`). Where the
law sets the value (retention of medical records, accounting), the draft names the question rather than
guessing the answer.
