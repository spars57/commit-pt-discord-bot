import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { logger } from '../logger';

const dbPath = join(process.cwd(), 'data', 'database.db');

mkdirSync(join(process.cwd(), 'data'), { recursive: true });

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_xp (
    user_id  TEXT    NOT NULL,
    guild_id TEXT    NOT NULL,
    xp       INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, guild_id)
  )
`);

// Safe migration — ignored if column already exists
try {
  db.exec(`ALTER TABLE user_xp ADD COLUMN last_message_at INTEGER`);
} catch {
  // column already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS invite_tracker (
    guild_id    TEXT    NOT NULL,
    inviter_id  TEXT    NOT NULL,
    invitee_id  TEXT    NOT NULL,
    invite_code TEXT    NOT NULL,
    joined_at   INTEGER NOT NULL
  )
`);

// Safe migration: deduplicate and add unique index on (guild_id, invitee_id)
try {
  db.exec(`
    DELETE FROM invite_tracker
    WHERE rowid NOT IN (
      SELECT MAX(rowid)
      FROM invite_tracker
      GROUP BY guild_id, invitee_id
    )
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_invite_tracker_unique
    ON invite_tracker (guild_id, invitee_id)
  `);
} catch {
  // index already exists
}

logger.success(`[database] SQLite ready at ${dbPath}`);
