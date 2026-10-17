# Variant management manual checklist

Run these against a test bot. Every reply from the bot is prefixed with an accept or reject emoji and shown in bold; the text below is the part after it. `<name>` stands for the variant name exactly as typed, which the bot always shows in inline code.

## Prerequisites

- [ ] A test bot whose `DPP_BROKER_URL` points at the broker under test.
- [ ] Mahiru's and the score service's broker keys have `can_act_for_users`.
- [ ] The four defaults exist and are public: `droid-live`, `osu-live`, `droid-rebalance`, `osu-rebalance`.
- [ ] One private variant (called `secret-variant` below) with a title, an alias (called `secret-alias` below), and a description longer than 1024 characters. It calculates the droid gamemode.
- [ ] Three test users: user A has a `/userbind` and is granted access to `secret-variant`; user B has a bind and no grant; user C has no bind.

## `/calculate`

Use a ranked beatmap ID and no other options unless stated.

- [ ] **Defaults:** `/calculate beatmap:<id>` as user B replies with the calculation embed. It uses `droid-live` and `osu-live`.
- [ ] **Chosen variants:** `/calculate variant:droid-rebalance pcvariant:osu-rebalance` replies with an embed that differs from the defaults and uses the chosen variants.
- [ ] **Alias:** `/calculate variant:rebalance` (or `secret-alias` as user A) is treated as `droid-rebalance` (or `secret-variant`); the embed is the same as typing the canonical name.
- [ ] **Wrong mode (droid option):** `/calculate variant:osu-live` replies `I'm sorry, `osu-live` is not a droid variant!` and posts no embed.
- [ ] **Wrong mode (PC option):** `/calculate pcvariant:droid-live` replies `I'm sorry, `droid-live` is not a PC variant!` and posts no embed.
- [ ] **Unknown name:** `/calculate variant:nonexistent` replies `I'm sorry, I cannot find the variant `nonexistent`!`.
- [ ] **Private variant, no grant:** as user C, `/calculate variant:secret-variant` replies `I'm sorry, I cannot find the variant `secret-variant`!`. User B gets the same reply. User A gets the embed.
- [ ] **Name with a backtick:** `/calculate variant:a`b` replies with the variantNotFound text and the name stays inside the code block.
- [ ] **Option length:** the `variant` and `pcvariant` options refuse more than 100 characters in the Discord client.
- [ ] **Broker down:** stop the broker, wait 60 seconds for the cache to expire, and run `/calculate`. It replies `I'm sorry, I can't reach the variant list right now. Please try again later!` and posts no embed. Restart the broker and the command works again.

## `/recalc`

Use a player with several top scores.

- [ ] **Default variant:** `/recalc calculate uid:<uid>` as the bot owner replies `Successfully queued uid <uid> for recalculation (`droid-rebalance`).` and later posts `<mention>, successfully recalculated uid <uid>.`.
- [ ] **Private variant, granted:** as user A (bot owner), `/recalc calculate uid:<uid> variant:secret-variant` queues and completes the same way, with `secret-variant` in the queued reply.
- [ ] **Private variant, no grant:** as user B, `/recalc calculate uid:<uid> variant:secret-variant` replies `I'm sorry, I cannot find the variant `secret-variant`!` and nothing is queued.
- [ ] **Wrong mode:** `/recalc calculate uid:<uid> variant:osu-live` replies `I'm sorry, `osu-live` is not a droid variant!`.
- [ ] **Unavailable variant:** mark a droid variant as unavailable (for example, stop its processor so its summary reports `available: false`). `/recalc calculate uid:<uid> variant:<that variant>` replies `I'm sorry, the variant `<that variant>` is unavailable right now!` and nothing is queued. `/recalc calculateall variant:<that variant>` replies the same.
- [ ] **Same player, two variants:** run `/recalc calculate uid:<uid> variant:droid-rebalance` and `/recalc calculate uid:<uid> variant:secret-variant` back to back. `/recalc queue` lists both as `<uid> (`droid-rebalance`), <uid> (`secret-variant`)` while they run, and both post a `successfully recalculated` message.
- [ ] **Nothing calculated:** for a variant whose processor is down for the player's scores, the reply is `<mention>, recalculation for uid <uid> failed: No scores could be calculated.` and the stored profile is not overwritten.
- [ ] **Broker down:** with the broker stopped (and the cache expired), `/recalc calculate` and `/recalc calculateall` reply `I'm sorry, I can't reach the variant list right now. Please try again later!`.

## `/pp prototype`

- [ ] **Default check:** `/pp prototype check uid:<uid>` shows the `droid-rebalance` profile.
- [ ] **Long description:** `/pp prototype check uid:<uid> variant:secret-variant` as user A shows the variant's title in the `Variant` line and a `Description` field of at most 1024 characters ending with `…`. Page through the profile; the field stays on every page.
- [ ] **Blank description:** a variant whose description is only whitespace shows no `Description` field.
- [ ] **Unknown, ungranted, and wrong mode:** `variant:nonexistent` and (as user C) `variant:secret-variant` reply `I'm sorry, I cannot find the variant `<name>`!`. `variant:osu-live` replies `I'm sorry, `osu-live` is not a droid variant!`.
- [ ] **Unavailable variant:** `check` and `export` still show the stored profile of an unavailable variant.
- [ ] **Export:** `/pp prototype export uid:<uid> variant:secret-variant` attaches the file for that variant.
- [ ] **Broker down:** both subcommands reply `I'm sorry, I can't reach the variant list right now. Please try again later!`.

## `/leaderboard prototype`

- [ ] **Alias:** `/leaderboard prototype variant:rebalance` (or `secret-alias` as user A) shows the leaderboard of the variant the alias maps to, the same as typing the canonical name. The leaderboard has no title line.
- [ ] **Unknown, ungranted, and wrong mode:** the same replies as `/pp prototype check`.
- [ ] **Unavailable variant:** the stored leaderboard is still shown.
- [ ] **Broker down:** replies `I'm sorry, I can't reach the variant list right now. Please try again later!`.

## Autocomplete

- [ ] **Private variant visibility:** `secret-variant` (shown by its title) is NOT offered in variant autocomplete for users B and C, and IS offered for user A, in `/calculate`, `/recalc`, `/pp prototype`, and `/leaderboard prototype`.
- [ ] **Mode filter:** `/calculate variant` offers droid variants only, `pcvariant` offers PC variants only, and `/recalc` offers droid variants only.
- [ ] **Unavailable marker:** an unavailable variant shows as `<title or name> (unavailable)`.
- [ ] **Broker down:** autocomplete shows no choices and does not error.
