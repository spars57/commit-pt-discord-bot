import { db } from '../lib/database';

export interface UserXpRow {
  user_id: string;
  guild_id: string;
  xp: number;
  last_message_at: number | null;
}

export const queries = {
  getUserXp: db.prepare<[string, string], UserXpRow>(
    'SELECT xp, last_message_at FROM user_xp WHERE user_id = ? AND guild_id = ?',
  ),

  upsertUserXp: db.prepare<[string, string, number]>(`
    INSERT INTO user_xp (user_id, guild_id, xp)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, guild_id) DO UPDATE SET xp = excluded.xp
  `),

  upsertUserActivity: db.prepare<[string, string, number, number]>(`
    INSERT INTO user_xp (user_id, guild_id, xp, last_message_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, guild_id) DO UPDATE SET
      xp = excluded.xp,
      last_message_at = excluded.last_message_at
  `),

  getTopXp: db.prepare<[string, number], UserXpRow>(
    'SELECT * FROM user_xp WHERE guild_id = ? ORDER BY xp DESC LIMIT ?',
  ),
};
