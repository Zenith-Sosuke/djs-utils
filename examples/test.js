'use strict';

const toolbox = require('../src/index');

const required = [
  // Embeds
  'successEmbed', 'errorEmbed', 'warnEmbed', 'infoEmbed', 'loadingEmbed', 'customEmbed',
  // Moderation
  'parseDuration', 'formatDuration', 'canModerate', 'dmUser',
  'safeBan', 'safeKick', 'safeTimeout', 'safeUnban',
  'safeRoleAdd', 'safeRoleRemove', 'safeDeafen', 'safeUndeafen',
  'warnUser', 'getWarns', 'clearWarns',
  // Pagination
  'paginate', 'chunkArray',
  // Formatters
  'truncate', 'titleCase', 'formatNumber', 'formatBytes',
  'discordTimestamp', 'codeBlock', 'inlineCode',
  'mention', 'channelMention', 'roleMention',
  'pluralize', 'getTag', 'stripMarkdown', 'padStart', 'formatList',
  // Validators
  'isValidId', 'isValidUrl', 'isImageUrl', 'isValidHex', 'hexToInt',
  'hasPermissions', 'getMissingPermissions', 'isInRange', 'inNumericRange',
  // Permissions
  'isOwner', 'isAdmin', 'isModerator', 'botHasChannelPerm', 'botMissingChannelPerms',
  // Time
  'timeAgo', 'accountAge', 'memberAge', 'shortDate', 'fullDate',
  'addDuration', 'toUnix', 'msToSeconds', 'daysUntil',
  // Errors
  'CooldownManager', 'CooldownError', 'PermissionError',
  'UserNotFoundError', 'InvalidArgumentError', 'RateLimitError', 'NotInGuildError',
  // Logging
  'createLogger', 'logger',
  // Builders
  'buildButton', 'buildRow', 'buildConfirmRow', 'disableRow',
  'buildSelectMenu', 'buildModal', 'buildCard', 'buildFieldPages', 'confirmAction',
  // Components V2
  'v2Reply', 'buildTextDisplay', 'buildSeparator', 'buildThumbnail',
  'buildSection', 'buildMediaGallery', 'buildFile', 'buildContainer',
  'v2InfoCard', 'v2ProfileCard',
  // Random
  'randomChoice', 'randomSample', 'shuffle', 'randomInt', 'chance',
  // Retry
  'retry', 'sleep',
  // Sanitize
  'sanitizeInput', 'escapeMarkdown', 'maskSecret', 'normalizeWhitespace', 'stripAnsi',
];

let passed = 0;
let failed = 0;

for (const fn of required) {
  if (typeof toolbox[fn] === 'undefined') {
    console.error(`FAIL: ${fn} is not exported`);
    failed++;
  } else {
    console.log(`✓ ${fn}`);
    passed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed.`);

if (failed > 0) process.exit(1);