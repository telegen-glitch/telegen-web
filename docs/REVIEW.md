# Recording a medical review

Telegen's doctors are **never named or pictured on the public site** (owner decision, CLAUDE.md §v4.D).
The repository only ever contains an opaque id per doctor (for example `derm-1`), the specialty and the
credential type. **Keep the list that maps names to ids privately, outside the repository** (for
example in a password manager or a private document). Never put a name, parafă code, CMR number,
photo or email of a doctor in this repo, in a commit message or in a pull request.

A medical page can only appear in search engines when **all** of these are true:

1. the page is `status: "published"`;
2. its `review.reviewerId` is the id of a team member whose specialty fits the condition
   (dermatology for hair loss and acne; urology or family medicine for erectile dysfunction);
3. `review.reviewedAt` is a valid date that is not in the future;
4. the site is launched (`SITE_INDEXING=on` in production, see docs/LAUNCH.md).

When 1–3 hold, the page shows _"Revizuit medical de un medic [specialitate] din echipa Telegen · {data}"_
and its structured data gets `reviewedBy: Telegen` and `lastReviewed`. A doctor is never a `Person` in
the schema.

## One-time: add each doctor (by id only)

File: `src/content/clinicians.ts`, array `team`.

```ts
export const team: TeamMember[] = [
  { kind: "team-member", id: "derm-1", specialty: "dermatologie", credentialType: "medic-specialist" },
  { kind: "team-member", id: "uro-1", specialty: "urologie", credentialType: "medic-primar" },
];
```

- `specialty`: `"dermatologie"`, `"urologie"` or `"medicina-de-familie"`.
- `credentialType`: `"medic-specialist"` or `"medic-primar"`.
- Commit message: `team: add derm-1` (no name).

## Each review: one commit per page

1. The doctor reads the page on the preview link and completes the checklist below.
2. In the page's content file, add the review to that page's object:
   - hub pages: `src/content/conditions/<condition>.ts` → `doc`
   - subpages: same file → the entry in `subpages`
   - guides: `src/content/guides.ts`; medicine pages: `src/content/treatments.ts`

   ```ts
   review: { reviewerId: "derm-1", reviewedAt: "2026-11-02" },
   ```

3. If the doctor asked for changes, make them in the same commit and set `updatedAt` to the same date.
4. Commit message: `review: /acnee/cauze by derm-1 (2026-11-02)`. One page per commit.
5. Any later change to the medical content of that page needs a new review (new date) before it is
   merged.

The build fails if a review points to an unknown id, the wrong specialty or a future date (tests in
`tests/unit/indexing.test.ts`).

## Doctor sign-off checklist (per page)

Keep the signed checklist with the private name-to-id log, not in the repository.

- [ ] Page URL and date of review recorded.
- [ ] Every clinical statement is correct for current practice in Romania.
- [ ] Every statement is supported by the cited source, and the sources are current.
- [ ] No efficacy or safety figure appears without a primary source on the page.
- [ ] The "Când ai nevoie de consult în persoană" advice is complete and safe.
- [ ] Contraindications and warnings are correct and visible (for example nitrates and riociguat on ED pages).
- [ ] Medicine information is neutral: no promotion, no price, no call to action next to a medicine.
- [ ] No guarantee, cure claim, fear framing, performance or size language.
- [ ] The evaluation questions and hard-stop texts for this condition are clinically appropriate.
- [ ] Romanian medical terminology and diacritics are correct.
- [ ] I agree that the page states it was reviewed by "un medic [specialitate] din echipa Telegen".

Reviewer id: ________ Specialty: ________ Date: ________ Signature: ________
