# Variant Management, Step 2 (Mahiru) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mahiru reads variants from the broker instead of the `prototypepptype` collection: `/calculate` takes a droid
and a PC variant, the prototype commands take a variant (default `droid-rebalance`), and private variants follow the
invoking user's bound uid.

**Architecture:** `PPProcessorRESTManager` gains variant-name calls that send `X-Acting-Uid`. A new `PPVariantManager`
fetches and caches `GET /variants` per acting uid, resolves names and aliases to canonical variants, builds
autocomplete choices, and turns a Discord user into an acting uid through `userbind`. Commands resolve every named
variant through it, so a variant the user cannot see behaves as if it does not exist.

**Tech Stack:** TypeScript (CommonJS, `tsc`), discord.js, MongoDB, Vitest (new, unit tests only).

**Spec:** `~/Projects/dpp-processor-backend/docs/superpowers/specs/2026-10-17-variant-management-design.md`, section
"2. Mahiru". The broker API it calls is in that spec's section 1 and `apps/broker/README.md` of that repo.

## Global Constraints

- Work in a git worktree of `~/Projects/Mahiru` on branch `variant-management`. Commit after every task; messages end
  with the `Co-Authored-By` trailer your own harness attribution reminder gives.
- Default variant names are exactly `droid-live`, `osu-live`, `droid-rebalance`, `osu-rebalance`.
- `prototypepp.reworkType` stores the **canonical** variant name (`VariantSummary.name`), never an alias.
- Autocomplete shows `title ?? name`; the choice value is `name`. Discord allows at most 25 choices and 100-character
  names.
- The variant list cache lives 60 seconds per acting uid.
- An acting uid is sent only for a user with a `userbind` entry; users without one see public variants only.
- Follow existing conventions: static `Manager` classes, `@utils/...` path aliases, JSDoc on exported members,
  localization through `*Localization` classes with EN text and `""` for other languages (empty falls back to EN).
- Before each commit: `pnpm type-check`, `pnpm analyze-code`, `pnpm test`.

## Decisions This Plan Adds to the Spec

- **Typed defaults kept.** The existing `(mode, PPCalculationMethod)` overloads of `PPProcessorRESTManager` stay for
  the ~20 callers that only want live or rebalance results; their variant names now come from the defaults module
  instead of a string template. New variant-name methods serve commands where a person picks a variant.
- **Resolution uses the cached list.** A name is resolved against the cached `GET /variants` list (which carries
  aliases) instead of a separate `GET /variants/:name` call; visibility is the same because the list is already
  filtered for the acting uid.
- **Vitest for unit tests only.** Mahiru has no tests; this plan adds Vitest for the new pure logic (variant manager,
  REST request shaping, prototype variant mapping, description truncation). Commands are verified by type-check and
  the manual checklist in Task 6.
- **`/leaderboard prototype`'s `rework` option becomes `variant`**, as for `/pp prototype`.
- **Long descriptions are truncated** to 1024 characters (an embed field's limit) with `…` in `/pp prototype check`.

## Review Focus

1. A user without a bind typing a private variant's name must get "variant not found", never its data (Task 2 test
   `hides private variants from users without a bind`).
2. A variant whose `mode` is `null` (its processor never answered since the broker started) must give a clear
   "unavailable" rejection in `/calculate`, not a crash or a wrong-mode message (Task 3 test
   `classifies a variant with no mode as unavailable`).
3. One user's cached private list must never be served to another (Task 2 test `caches variant lists per acting uid`).
4. A 4000-character description must not break the `/pp prototype check` embed (Task 5 test
   `truncates descriptions to 1024 characters`).
5. Naming a variant by alias must store and read `prototypepp` under the canonical name (Task 2 test
   `resolves aliases to the canonical variant`).

---

### Task 1: Variant requests in the REST manager, with Vitest

**Files:**
- Create: `vitest.config.mts`, `src/utils/pp/DefaultPPVariants.ts`, `src/structures/utils/PPVariantSummary.ts`,
  `src/utils/managers/PPProcessorRESTManager.test.ts`
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`), `tsconfig.json` (exclude
  `**/*.test.ts` and `vitest.config.mts` from the build), `src/utils/managers/PPProcessorRESTManager.ts`,
  `.github/workflows/ci.yml`

**Interfaces:**
- Produces:
  - `DefaultPPVariants = { droidLive: "droid-live", osuLive: "osu-live", droidRebalance: "droid-rebalance", osuRebalance: "osu-rebalance" } as const`.
  - `interface PPVariantSummary { name: string; title: string | null; aliases: string[]; description: string | null; available: boolean; mode: Modes | null; algorithm: "live" | "rebalance" | null; calculatorVersion: string | null; builtAt: string | null }`.
  - `PPProcessorRESTManager.getVariants(actingUid?: number): Promise<PPVariantSummary[] | null>` (`GET /variants`).
  - `PPProcessorRESTManager.getPerformanceAttributesForVariant<THasStrainChart extends boolean>(beatmapIdOrHash: string | number, variant: string, calculationParams?: PerformanceCalculationParameters, generateStrainChart?: THasStrainChart, actingUid?: number): Promise<PPProcessorCalculationResponse<CompleteCalculationAttributes<RawDifficultyAttributes, PerformanceAttributes>, THasStrainChart> | null>`.
  - `PPProcessorRESTManager.getOnlineScoreAttributesForVariant<THasStrainChart extends boolean>(uid: number, hash: string, variant: string, calculateBestPPScore?: boolean, generateStrainChart?: THasStrainChart, actingUid?: number)`, same return shape.

  `X-Acting-Uid` is sent when `actingUid` is defined: on broker calls, and on the score-service call (which forwards
  it). The existing typed overloads call these with the default names; `getVariant(mode, method)` maps to
  `DefaultPPVariants` and keeps its signature.
- Vitest resolves the `tsconfig.json` path aliases (with `vite-tsconfig-paths`, or by mapping the eight aliases in
  `resolve.alias`; implementer's choice). It only collects `src/**/*.test.ts`.

- [ ] **Step 1: Set up Vitest** and confirm `pnpm test` runs, reporting no test files. Confirm `pnpm build` still
  succeeds and emits no test files. Use `passWithNoTests: true` until Step 2's tests exist, then remove it.
- [ ] **Step 1b: Run the tests in CI.** In `.github/workflows/ci.yml`:
  - Change the triggers to `push` on `master` only, plus `pull_request`.
  - Change `concurrency.group` from the shared `ci` to `${{ github.workflow }}-${{ github.ref }}`, so a pull request
    run no longer cancels a `master` run.
  - Add a `Test` job that mirrors the `Build` job's checkout, pnpm, Node 24, and install steps, then runs
    `pnpm test`.

  Keep the existing action versions and step style. Use no `${{ }}` expressions in `run:` lines.
- [ ] **Step 2: Write the failing tests** in `PPProcessorRESTManager.test.ts`. Stub `RESTManager.request` (the
  protected static that the manager calls) with `vi.spyOn`, and set `DPP_BROKER_URL` and `DPP_BROKER_KEY` in
  `process.env`.
  - `maps live and rebalance to the default variants`: `getPerformanceAttributes(1, Modes.Droid, PPCalculationMethod.rebalance)` requests a URL ending `/variants/droid-rebalance/performance`.
  - `sends X-Acting-Uid only when acting for a person`: `getVariants(42)` sends the header `"42"`; `getVariants()` sends none.
  - `returns null when the broker refuses a variant`: a 404 response gives `null`.
- [ ] **Step 3: Run them.** `pnpm test`. Expected: FAIL.
- [ ] **Step 4: Implement** the module, the type, and the REST methods.
- [ ] **Step 5: Run** `pnpm test`, `pnpm type-check`, `pnpm analyze-code`. Expected: PASS.
- [ ] **Step 6: Commit.** `Add variant-name requests to the pp processor REST manager`

### Task 2: Variant manager

**Files:**
- Create: `src/utils/managers/PPVariantManager.ts`, `src/utils/managers/PPVariantManager.test.ts`

**Interfaces:**
- Consumes: `PPProcessorRESTManager.getVariants`, `PPVariantSummary`, `DefaultPPVariants`.
- Produces: static methods on `PPVariantManager`:
  - `getVariants(actingUid?: number): Promise<PPVariantSummary[]>`. Cached 60 s per `actingUid ?? "anonymous"`. A
    failed fetch returns `[]` and is not cached.
  - `resolve(name: string, actingUid?: number): Promise<PPVariantSummary | null>`. Matches `name` or any of
    `aliases` (case-sensitive, as the broker is) in the list.
  - `getActingUid(user: User): Promise<number | undefined>`. The bound uid from
    `DatabaseManager.elainaDb.collections.userBind.getFromUser(user, { projection: { _id: 0, uid: 1 } })`.
  - `searchForAutocomplete(query: string, options: { actingUid?: number; mode?: Modes; prototypeOnly?: boolean }):
    Promise<ApplicationCommandOptionChoiceData<string>[]>`:
    - case-insensitive substring match on `name`, `title`, and aliases;
    - `mode` filters by mode; `prototypeOnly` keeps only `mode === Modes.Droid`;
    - variants with `mode === null` are left out whenever a mode filter applies;
    - an unavailable variant's display name gets the suffix ` (unavailable)`;
    - sorted by name, at most 25 choices, display names cut to 100 characters.

- [ ] **Step 1: Write the failing tests.** Stub `getVariants` on `PPProcessorRESTManager` with `vi.spyOn`.
  Fixtures:
  - `droid-live`: public, droid;
  - `droid-rebalance`: droid, alias `rebalance`;
  - `osu-live`: osu;
  - `secret`: droid, returned only for acting uid 7;
  - `pending`: mode `null`.

  Tests:
  - `caches variant lists per acting uid`: two calls for uid 7 fetch once; uid 8 and no uid each fetch separately;
    after 61 s (fake timers) uid 7 fetches again.
  - `hides private variants from users without a bind`: `resolve("secret")` → `null`; `resolve("secret", 7)` → the
    variant.
  - `resolves aliases to the canonical variant`: `resolve("rebalance")` has `name === "droid-rebalance"`.
  - `does not cache a failed fetch`: the stub returns `null`, then a list; the second call returns the list.
  - `builds autocomplete choices by mode`: with `{ mode: Modes.Osu }` only `osu-live`; with `{ prototypeOnly: true }`
    the droid variants without `pending`; an unavailable variant's name ends ` (unavailable)`; the title is used
    when present; at most 25 choices.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.** Keep a `clearCache()` for tests only if needed, and mark it `@internal`.
- [ ] **Step 4: Run** `pnpm test`, `pnpm type-check`, `pnpm analyze-code`. Expected: PASS.
- [ ] **Step 5: Commit.** `Add a variant manager with per-person caching`

### Task 3: `/calculate` variants

**Files:**
- Modify:
  - `src/interactions/commands/osu! and osu!droid/calculate/calculate.ts`
  - `src/localization/interactions/commands/osu! and osu!droid/calculate/CalculateLocalization.ts` and its four
    translations
- Create:
  - `src/interactions/autocomplete/osu! and osu!droid/calculate/calculate.ts`
  - `src/utils/pp/variantChoice.ts`
  - `src/utils/pp/variantChoice.test.ts`

**Interfaces:**
- Consumes: `PPVariantManager.resolve/getActingUid/searchForAutocomplete`,
  `PPProcessorRESTManager.getPerformanceAttributesForVariant`, `DefaultPPVariants`.
- Produces: `checkVariant(variant: PPVariantSummary | null, mode: Modes): "ok" | "notFound" | "unavailable" | "wrongMode"`
  in `variantChoice.ts`, mapped in this order:
  - `null` → `notFound`;
  - `mode === null` or `algorithm === null` → `unavailable`;
  - `mode !== mode` → `wrongMode`;
  - otherwise `ok`.

  Tasks 4 and 5 reuse it.
- Options:
  - `calculationmethod` is removed.
  - New `variant` (String, autocomplete, droid): "The droid variant to calculate with. Defaults to droid-live."
  - New `pcvariant` (String, autocomplete, osu): "The PC variant to calculate with. Defaults to osu-live."

  Update the command's `example` entries that mention the calculation method.
- Localization keys: `variantNotFound` ("I'm sorry, I cannot find the variant %s!"), `variantUnavailable` ("I'm sorry,
  the variant %s is unavailable right now!"), `variantWrongMode` ("I'm sorry, %s is not a %s variant!"). Use `""` in
  ES, ID and KR.
- Behavior:
  - Resolve both variants with the invoker's acting uid, and reject on the first check that isn't `ok`.
  - Calculate each with `getPerformanceAttributesForVariant`, passing the acting uid; the droid variant requests a
    strain chart.
  - Pick live or rebalance formatting (`PPHelper.*Rebalance*` vs live) and the `createCalculationEmbed` attribute
    casts from each variant's `algorithm`, replacing the `calculationmethod` switch.

- [ ] **Step 1: Write the failing test** `classifies a variant with no mode as unavailable` in `variantChoice.test.ts`,
  plus one case for each other outcome.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement** the helper, the command, the autocomplete handler (option `variant` → `{ mode: Modes.Droid }`,
  `pcvariant` → `{ mode: Modes.Osu }`, both with the invoker's acting uid), and the localization.
- [ ] **Step 4: Run** `pnpm test`, `pnpm type-check`, `pnpm analyze-code`. Expected: PASS.
- [ ] **Step 5: Commit.** `Let /calculate choose droid and PC variants`

### Task 4: Prototype recalculation by variant

**Files:**
- Modify:
  - `src/utils/managers/PrototypeRecalculationManager.ts`
  - `src/structures/pp/RecalculationQueue.ts`
  - `src/interactions/commands/osu! and osu!droid/recalc/recalc.ts`, plus its `subcommands/recalc-calculate.ts` and
    `subcommands/recalc-calculateall.ts`
  - `src/interactions/autocomplete/osu! and osu!droid/recalc/recalc.ts`
  - `src/database/managers/aliceDb/PrototypePPCollectionManager.ts`
  - `src/localization/interactions/commands/osu!droid Elaina PP Project/recalc/RecalcLocalization.ts` and its
    translations
- Create: `src/utils/pp/prototypeVariants.ts`, `src/utils/pp/prototypeVariants.test.ts`

**Interfaces:**
- Produces: `prototypeVariants(variant: string): { live: string; local: string; master?: string }` in
  `prototypeVariants.ts`. It returns `live: DefaultPPVariants.droidLive`, `local: variant`, and
  `master: DefaultPPVariants.droidRebalance` only when `variant !== DefaultPPVariants.droidRebalance`.
- `RecalculationQueue` becomes `{ interaction; uid; variant: string; actingUid?: number }`.
- `PrototypeRecalculationManager.queue(interaction, uid, variant, actingUid?)` and
  `calculatePlayer(uid, variant, actingUid?)`.
  - They use `prototypeVariants` and `getOnlineScoreAttributesForVariant`, passing `actingUid` on every call.
  - They store under `reworkType: variant`.
  - The success link uses the variant name.
- `PrototypePPCollectionManager.cloneOverallToRework(reworkType)` becomes `cloneToVariant(source: string, target: string)`.
- `/recalc` changes:
  - `calculate` gains `variant` (String, autocomplete, default `droid-rebalance`). The variant must resolve for the
    invoker.
  - `calculateall`: `reworktype` becomes optional `variant` (default `droid-rebalance`), and `reworkname` is removed.
    The variant must resolve for the invoker. With no `prototypepp` documents for it, it clones
    `droid-rebalance`'s, unless it *is* `droid-rebalance`.
  - The `CURRENT_REWORK_TYPE` checks are removed.
- Autocomplete: `variant` → `searchForAutocomplete(query, { prototypeOnly: true, actingUid })`.
- Localization: remove `reworkNameMissing`, `reworkTypeNotCurrent` and `reworkTypeDoesntExist`; add
  `variantNotFound` and `variantUnavailable` with the same EN text as Task 3.

- [ ] **Step 1: Write the failing tests:** `uses droid-rebalance as master for other variants` and
  `has no master for droid-rebalance`.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement.** Resolve with `checkVariant(variant, Modes.Droid)` from Task 3.
- [ ] **Step 4: Run** `pnpm test`, `pnpm type-check`, `pnpm analyze-code`. Expected: PASS.
- [ ] **Step 5: Commit.** `Recalculate prototype profiles by variant`

### Task 5: Prototype profile and leaderboard by variant

**Files:**
- Modify:
  - `src/interactions/commands/osu! and osu!droid/pp/pp.ts`, plus its `subcommandGroups/pp-prototype/subcommands/pp-prototype-check.ts` and `pp-prototype-export.ts`
  - `src/interactions/commands/osu! and osu!droid/leaderboard/leaderboard.ts` and `subcommands/leaderboard-prototype.ts`
  - `src/interactions/autocomplete/osu! and osu!droid/pp/pp.ts` and `.../leaderboard/leaderboard.ts`
  - the `pp` and `leaderboard` localization files
- Create: `src/utils/helpers/truncate.ts` (or add a method to the existing `StringHelper` if one fits),
  `src/utils/helpers/truncate.test.ts`

**Interfaces:**
- Consumes: `PPVariantManager`, `checkVariant`, `DefaultPPVariants`.
- Produces: `truncate(text: string, maxLength: number): string`, which returns `text` unchanged when it fits, and
  otherwise the first `maxLength - 1` characters plus `…`.
- Option changes:
  - `/pp prototype check|export`: `rework` becomes `variant`, with the description "The variant to check. Defaults
    to droid-rebalance." (export: "…to export…").
  - `/leaderboard prototype`: `rework` becomes `variant`, defaulting to `droid-rebalance`.

  All three resolve with the invoker's acting uid and `checkVariant(…, Modes.Droid)`. Reject on `notFound` and
  `wrongMode` with `variantNotFound`. `unavailable` still shows stored data, since reading it needs no processor.
- Database lookups use the resolved canonical `name`.
- `/pp prototype check` embed:
  - the rework line shows `title ?? name`;
  - when the variant has a description, it adds a field with the new key `variantDescription` ("Description") and
    the value `truncate(description, 1024)`.
- Localization: `pp` replaces `reworkTypeDoesntExist` with `variantNotFound`, and the EN text of
  `reworkTypeEmbedDescription` becomes "Variant". `leaderboard` adds `variantNotFound`.

- [ ] **Step 1: Write the failing test** `truncates descriptions to 1024 characters`, with 1024 characters unchanged
  and 1025 characters becoming 1024 ending `…`.
- [ ] **Step 2: Run it.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `pnpm test`, `pnpm type-check`, `pnpm analyze-code`. Expected: PASS.
- [ ] **Step 5: Commit.** `Read prototype profiles and leaderboards by variant`

### Task 6: Remove rework types and verify

**Files:**
- Delete: `src/database/utils/aliceDb/PrototypePPType.ts`,
  `src/database/managers/aliceDb/PrototypePPTypeCollectionManager.ts`,
  `src/structures/database/aliceDb/DatabasePrototypePPType.ts`
- Modify: `src/database/AliceDBCollection.ts` (drop `prototypePPType`), `src/globals.d.ts` (drop
  `CURRENT_REWORK_TYPE`), any remaining references
- Create: `docs/superpowers/plans/2026-10-17-variant-management-mahiru-checklist.md`

- [ ] **Step 1: Remove** the files and references. `grep -rn "prototypePPType\|PrototypePPType\|CURRENT_REWORK_TYPE\|reworkTypeDoesntExist" src` returns nothing.
- [ ] **Step 2: Write the manual checklist.** These are Discord checks for the owner to run against a test bot:
  - `/calculate` with the defaults, with each option, with a wrong-mode variant, and with an unknown name;
  - `/recalc calculate` with the default variant and with a private variant, as a user with access and as one
    without;
  - `/pp prototype check` with a long description;
  - `/leaderboard prototype` named by an alias.
- [ ] **Step 3: Run** `pnpm type-check && pnpm analyze-code && pnpm test && pnpm build`. Expected: all succeed.
- [ ] **Step 4: Commit.** `Remove prototype rework types`
