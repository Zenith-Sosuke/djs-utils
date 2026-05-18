/**
 * Moderation utility helpers for Discord.js v14
 */

/**
 * Parses a duration string like "10m", "2h", "1d" into milliseconds
 * @param {string} str - e.g. "10m", "2h", "3d", "30s"
 * @returns {number|null} milliseconds, or null if invalid
 */
function parseDuration(str) {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
  const match = str.match(/^(\d+)([smhdw])$/i);
  if (!match) return null;
  return parseInt(match[1]) * units[match[2].toLowerCase()];
}

/**
 * Converts milliseconds to a human-readable string
 * @param {number} ms
 * @returns {string} e.g. "2 hours, 30 minutes"
 */
function formatDuration(ms) {
  const parts = [];
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (days) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds && !days && !hours) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

  return parts.join(', ') || '0 seconds';
}

/**
 * Checks if a member is moderatable (lower role than executor)
 * @param {GuildMember} target - The member to moderate
 * @param {GuildMember} executor - The moderator
 * @returns {{ ok: boolean, reason: string }}
 */
function canModerate(target, executor) {
  if (target.id === executor.guild.ownerId) {
    return { ok: false, reason: 'Cannot moderate the server owner.' };
  }
  if (target.id === executor.id) {
    return { ok: false, reason: 'You cannot moderate yourself.' };
  }
  if (target.roles.highest.position >= executor.roles.highest.position) {
    return { ok: false, reason: 'Target has an equal or higher role than you.' };
  }
  if (!target.moderatable) {
    return { ok: false, reason: 'I cannot moderate this member (check my role position).' };
  }
  return { ok: true, reason: null };
}

/**
 * Safely DMs a user before a moderation action
 * @param {GuildMember} member
 * @param {EmbedBuilder} embed
 * @returns {Promise<boolean>} true if DM was sent, false if it failed
 */
async function dmUser(member, embed) {
  try {
    await member.send({ embeds: [embed] });
    return true;
  } catch {
    return false;
  }
}

/**
 * Attempts to ban a member with reason and optional delete message days
 * @param {GuildMember} member
 * @param {string} reason
 * @param {number} [deleteMessageDays=0] - 0–7
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
async function safeBan(member, reason, deleteMessageDays = 0) {
  try {
    await member.ban({ reason, deleteMessageSeconds: deleteMessageDays * 86400 });
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Attempts to kick a member with reason
 * @param {GuildMember} member
 * @param {string} reason
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
async function safeKick(member, reason) {
  try {
    await member.kick(reason);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Attempts to timeout a member
 * @param {GuildMember} member
 * @param {number} durationMs - duration in milliseconds (max 28 days)
 * @param {string} reason
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
async function safeTimeout(member, durationMs, reason) {
  const MAX = 28 * 24 * 60 * 60 * 1000; // 28 days
  if (durationMs > MAX) return { success: false, error: 'Timeout duration exceeds 28 days.' };
  try {
    await member.timeout(durationMs, reason);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Attempts to unban a user by ID
 * @param {import('discord.js').Guild} guild
 * @param {string} userId
 * @param {string} reason
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
async function safeUnban(guild, userId, reason) {
  try {
    await guild.bans.remove(userId, reason);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Attempts to add a role to a member
 * @param {GuildMember} member
 * @param {Role|string} role - Role object or role ID
 * @param {string} reason
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
async function safeRoleAdd(member, role, reason) {
  try {
    await member.roles.add(role, reason);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Attempts to remove a role from a member
 * @param {GuildMember} member
 * @param {Role|string} role - Role object or role ID
 * @param {string} reason
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
async function safeRoleRemove(member, role, reason) {
  try {
    await member.roles.remove(role, reason);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Attempts to server-deafen a member in a voice channel
 * @param {GuildMember} member
 * @param {string} reason
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
async function safeDeafen(member, reason) {
  if (!member.voice?.channel) {
    return { success: false, error: 'Member is not in a voice channel.' };
  }
  try {
    await member.voice.setDeaf(true, reason);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Attempts to remove server-deafen from a member in a voice channel
 * @param {GuildMember} member
 * @param {string} reason
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
async function safeUndeafen(member, reason) {
  if (!member.voice?.channel) {
    return { success: false, error: 'Member is not in a voice channel.' };
  }
  try {
    await member.voice.setDeaf(false, reason);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * In-memory warning store. Warns are lost on bot restart.
 * For persistence, integrate your own database on top of this.
 */
const _warns = new Map(); // guildId:userId → warn[]

/**
 * Adds a warning to a member and returns their updated warn list
 * @param {GuildMember} member
 * @param {string} reason
 * @param {GuildMember} moderator
 * @returns {{ id: number, reason: string, moderatorId: string, timestamp: number }[]}
 */
function warnUser(member, reason, moderator) {
  const key = `${member.guild.id}:${member.id}`;
  if (!_warns.has(key)) _warns.set(key, []);
  const warns = _warns.get(key);
  warns.push({
    id: warns.length + 1,
    reason,
    moderatorId: moderator.id,
    timestamp: Date.now(),
  });
  return warns;
}

/**
 * Gets all warnings for a member
 * @param {GuildMember} member
 * @returns {{ id: number, reason: string, moderatorId: string, timestamp: number }[]}
 */
function getWarns(member) {
  return _warns.get(`${member.guild.id}:${member.id}`) ?? [];
}

/**
 * Clears all warnings for a member
 * @param {GuildMember} member
 * @returns {void}
 */
function clearWarns(member) {
  _warns.delete(`${member.guild.id}:${member.id}`);
}

module.exports = {
  parseDuration,
  formatDuration,
  canModerate,
  dmUser,
  safeBan,
  safeKick,
  safeTimeout,
  safeUnban,
  safeRoleAdd,
  safeRoleRemove,
  safeDeafen,
  safeUndeafen,
  warnUser,
  getWarns,
  clearWarns,
};