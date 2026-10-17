# Variant management manual checklist

Run these against a test bot. Each step lists the expected result.

- [ ] **`/calculate` with defaults:** the calculation uses the default droid and PC variants and replies with a result.
- [ ] **`/calculate` with each option set:** choosing a droid variant and a PC variant each produces a result that uses the chosen variant.
- [ ] **`/calculate` with a wrong-mode variant:** a variant that does not match the mode is rejected with an error, and no result is posted.
- [ ] **`/calculate` with an unknown variant name:** the command replies with an error saying the variant was not found, and no result is posted.
- [ ] **`/recalc calculate` with the default variant:** the recalculation runs and reports completion for the default variant.
- [ ] **`/recalc calculate` with a private variant as a user with access:** the recalculation runs against the private variant.
- [ ] **`/recalc calculate` with a private variant as a user without access:** the command is refused, and the private variant is not usable.
- [ ] **Autocomplete visibility of a private variant:** the private variant does NOT appear in variant autocomplete for a user without access, and DOES appear for a user with access.
- [ ] **`/pp prototype check` with a long description:** the reply shows the check result without failing on the long text, and the description is shown in full or truncated to the Discord limit.
- [ ] **`/leaderboard prototype` named by an alias:** the leaderboard for the variant the alias maps to is shown, and the title matches that variant.
