import { Collection, Guild, GuildMember, Invite } from 'discord.js';
import { db } from '../lib/database';
import { logger } from '../logger';

// In-memory cache: guildId -> (inviteCode -> uses)
const inviteCache = new Collection<string, Collection<string, number>>();

export async function cacheGuildInvites(guild: Guild): Promise<void> {
  try {
    const invites = await guild.invites.fetch();
    const map = new Collection<string, number>();
    for (const invite of invites.values()) {
      map.set(invite.code, invite.uses ?? 0);
    }
    inviteCache.set(guild.id, map);
    logger.info(`[inviteTracker] Cached ${map.size} invites for "${guild.name}"`);
  } catch (err) {
    logger.warn(`[inviteTracker] Could not fetch invites for "${guild.name}": ${err}`);
  }
}

export async function handleInviteUsed(member: GuildMember): Promise<void> {
  const guild = member.guild;

  let freshInvites: Collection<string, Invite>;
  try {
    freshInvites = await guild.invites.fetch();
  } catch (err) {
    logger.warn(`[inviteTracker] Could not fetch invites on member join: ${err}`);
    return;
  }

  const cached = inviteCache.get(guild.id) ?? new Collection<string, number>();

  // Find the invite whose use count increased by 1
  let usedInvite: Invite | undefined;
  for (const invite of freshInvites.values()) {
    const prevUses = cached.get(invite.code) ?? 0;
    if ((invite.uses ?? 0) > prevUses) {
      usedInvite = invite;
      break;
    }
  }

  // Update cache with fresh data
  const updatedMap = new Collection<string, number>();
  for (const invite of freshInvites.values()) {
    updatedMap.set(invite.code, invite.uses ?? 0);
  }
  inviteCache.set(guild.id, updatedMap);

  if (!usedInvite || !usedInvite.inviter) {
    logger.warn(`[inviteTracker] Could not determine invite used by ${member.user.tag}`);
    return;
  }

  const inviterId = usedInvite.inviter.id;
  const inviterTag = usedInvite.inviter.tag;

  db.prepare(
    `INSERT OR REPLACE INTO invite_tracker (guild_id, inviter_id, invitee_id, invite_code, joined_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(guild.id, inviterId, member.id, usedInvite.code, Date.now());

  logger.success(
    `[inviteTracker] ${member.user.tag} joined via invite from ${inviterTag} (code: ${usedInvite.code})`,
  );
}

export function updateInviteCache(guildId: string, code: string, uses: number): void {
  const map = inviteCache.get(guildId) ?? new Collection<string, number>();
  map.set(code, uses);
  inviteCache.set(guildId, map);
}

export function removeFromInviteCache(guildId: string, code: string): void {
  inviteCache.get(guildId)?.delete(code);
}

export function removeInviteRecord(guildId: string, inviteeId: string): void {
  const result = db
    .prepare(`DELETE FROM invite_tracker WHERE guild_id = ? AND invitee_id = ?`)
    .run(guildId, inviteeId);

  if (result.changes > 0) {
    logger.info(`[inviteTracker] Removed invite record for ${inviteeId} (left the server)`);
  }
}

export function getInviterStats(
  guildId: string,
  inviterId: string,
): { total: number; invitees: string[] } {
  const rows = db
    .prepare(
      `SELECT invitee_id FROM invite_tracker WHERE guild_id = ? AND inviter_id = ? ORDER BY joined_at DESC`,
    )
    .all(guildId, inviterId) as { invitee_id: string }[];

  return { total: rows.length, invitees: rows.map((r) => r.invitee_id) };
}

export function getInvitesLeaderboard(
  guildId: string,
  limit = 10,
): { inviterId: string; total: number }[] {
  const rows = db
    .prepare(
      `SELECT inviter_id, COUNT(DISTINCT invitee_id) as total FROM invite_tracker WHERE guild_id = ?
       GROUP BY inviter_id ORDER BY total DESC LIMIT ?`,
    )
    .all(guildId, limit) as { inviter_id: string; total: number }[];

  return rows.map((r) => ({ inviterId: r.inviter_id, total: r.total }));
}

export function getInviterOf(
  guildId: string,
  inviteeId: string,
): { inviterId: string; code: string } | null {
  const row = db
    .prepare(
      `SELECT inviter_id, invite_code FROM invite_tracker WHERE guild_id = ? AND invitee_id = ? ORDER BY joined_at DESC LIMIT 1`,
    )
    .get(guildId, inviteeId) as { inviter_id: string; invite_code: string } | undefined;

  return row ? { inviterId: row.inviter_id, code: row.invite_code } : null;
}
