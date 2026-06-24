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

logger.success(`[database] SQLite ready at ${dbPath}`);
