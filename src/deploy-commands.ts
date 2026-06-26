import 'dotenv/config';
import {
  REST,
  Routes,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import * as ping from './commands/ping';
import * as members from './commands/members';
import * as info from './commands/info';
import * as links from './commands/links';
import * as rank from './commands/rank';
import * as setxp from './commands/setxp';
import * as leaderboard from './commands/leaderboard';
import * as logCommitPlus from './commands/log-commit-plus';
import * as sellMessage from './commands/sell-message';
import * as invites from './commands/invites';
import * as invitesFrom from './commands/invites-from';
import * as invitedBy from './commands/invited-by';

const commands: (
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder
)[] = [
  ping.data,
  members.data,
  info.data,
  links.data,
  rank.data,
  setxp.data,
  leaderboard.data,
  logCommitPlus.data,
  sellMessage.data,
  invites.data,
  invitesFrom.data,
  invitedBy.data,
];

const token = process.env.TOKEN!;
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!;

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map((c) => c.toJSON()),
    });
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error(error);
  }
})();
