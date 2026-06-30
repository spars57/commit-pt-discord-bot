import 'dotenv/config';
import {
  REST,
  Routes,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import * as criarNoticia from './commands/criar-noticia';
import * as stats from './commands/stats';
import * as enviarNoticias from './commands/enviar-noticias';
import * as ping from './commands/ping';
import * as members from './commands/members';
import * as info from './commands/info';
import * as links from './commands/links';
import * as me from './commands/me';
import * as setxp from './commands/setxp';
import * as leaderboard from './commands/leaderboard';
import * as logCommitPlus from './commands/log-commit-plus';
import * as sellMessage from './commands/sell-message';
import * as invites from './commands/invites';
import * as invitesFrom from './commands/invites-from';
import * as invitedBy from './commands/invited-by';
import * as help from './commands/help';
import * as selectRoles from './commands/select-roles';
import * as setupTickets from './commands/setup-tickets';
import * as selectLanguages from './commands/select-languages';
import * as participarProjetos from './commands/participar-projetos';
import * as receberAlertas from './commands/receber-alertas';

const commands: (
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder
)[] = [
  ping.data,
  members.data,
  info.data,
  links.data,
  me.data,
  setxp.data,
  leaderboard.data,
  logCommitPlus.data,
  sellMessage.data,
  invites.data,
  invitesFrom.data,
  invitedBy.data,
  help.data,
  selectRoles.data,
  selectLanguages.data,
  setupTickets.data,
  enviarNoticias.data,
  criarNoticia.data,
  stats.data,
  participarProjetos.data,
  receberAlertas.data,
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
