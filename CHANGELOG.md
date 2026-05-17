# Changelog

All notable changes to `discord.js-toolbox` are documented here. 

---

## v1.1.1

- Fixed npm publish conflict from v1.1.0

---

## v1.1.0

### New Modules
- **Logging** — `createLogger()` with named instances, log levels (`debug`/`info`/`warn`/`error`/`none`), ANSI colours, timestamps, and `log.time()` for async operation timing. Includes a default `logger` export for zero-setup use.
- **Builders (V1)** — Fluent helpers for classic discord.js v14 components: `buildButton`, `buildRow`, `buildConfirmRow`, `disableRow`, `buildSelectMenu`, `buildModal`, `buildCard`, `buildFieldPages`.
- **Components V2** — Full support for Discord's new display component system (March 2025): `v2Reply`, `buildTextDisplay`, `buildSeparator`, `buildThumbnail`, `buildSection`, `buildMediaGallery`, `buildFile`, `buildContainer`, and preset helpers `v2InfoCard` and `v2ProfileCard`.
- **Random** — `randomChoice`, `randomSample`, `shuffle`, `randomInt`, `chance`.
- **Retry** — `retry()` with exponential back-off, jitter, `shouldRetry` and `onRetry` hooks. Includes `sleep()`.
- **Sanitize** — `sanitizeInput`, `escapeMarkdown`, `stripMarkdown`, `stripAnsi`, `maskSecret`, `normalizeWhitespace`.

### Formatters
- Added `pluralize(count, word)` — returns correctly pluralized string.
- Added `getTag(user)` — returns display tag handling the new Discord username system.
- Added `stripMarkdown(str)` — strips all markdown formatting from a string.

### Embeds
- Added `randomColor()` — returns a random hex integer for use as an embed color.

### Moderation
- Added `safeUnban(guild, userId, reason)` — safe unban with error handling.

### Validators
- Added `isValidDuration(str)` — validates duration strings like `10m`, `2h`, `7d`.
- Added `isValidRole(guild, roleId)` — checks if a role exists in a guild.
- Added `clamp(value, min, max)` — clamps a number within a range.

### Time
- Added `msToSeconds(ms)` — converts milliseconds to seconds.
- Added `daysUntil(date)` — returns the number of days from now until a given date.

### Errors
- Added `RateLimitError(retryAfter)` — thrown when a rate limit is hit.
- Added `NotInGuildError()` — thrown when a command is used outside a guild.

### TypeScript
- Added `src/index.d.ts` — full type definitions for all modules (existing + new).

---

## v1.0.3

- Internal fixes and improvements.

---

## v1.0.2

- Added `CooldownManager` and custom error classes.
- Added time utilities: `timeAgo`, `accountAge`, `memberAge`, `shortDate`, `fullDate`, `addDuration`, `toUnix`.

---

## v1.0.1

- Added pagination: `paginate`, `chunkArray`.
- Added validators and permission helpers.

---

## v1.0.0

- Initial release.
- Moderation helpers: `canModerate`, `safeBan`, `safeKick`, `safeTimeout`, `dmUser`, `parseDuration`, `formatDuration`.
- Embed builders: `successEmbed`, `errorEmbed`, `warnEmbed`, `infoEmbed`, `loadingEmbed`, `customEmbed`.
- Formatters: `truncate`, `titleCase`, `formatNumber`, `formatBytes`, `discordTimestamp`, `codeBlock`, `inlineCode`, `mention`, `channelMention`, `roleMention`.
