# Commit PT Bot

A Discord bot for the Commit PT community server, built with TypeScript and discord.js v14.

---

## Features

### XP & Levels
Members earn XP by sending messages in the server. XP gain is rate-limited to one message per minute to prevent spam. The bot tracks each member's total XP and calculates their level, which can be checked via `/me`. A server-wide leaderboard is available via `/leaderboard`.

### Invite Tracking
The bot tracks which member invited each new user. This allows staff to see who invited whom and rank members by number of invites. Invite data is persisted in SQLite and survives bot restarts.

### Role Selection
Members can self-assign roles based on their area of interest and programming languages. Two dedicated embeds with buttons are available — one for areas (Frontend, Backend, Fullstack, DevOps, Cloud, Cybersecurity, Mobile, UI/UX, Data Science, Game Development, AI) and one for programming languages (JavaScript, TypeScript, Python, Java, Go, PHP, C/C++). Clicking a button toggles the role on or off.

### Tickets
Any member can open a support ticket by clicking a button in the tickets channel. They are prompted to describe the subject via a modal. A private channel is then created — visible only to the ticket creator and the Staff role — with a button to close and delete it when resolved.

### Commit+ Onboarding
When a member receives the Commit+ role, the bot automatically:
1. Announces it in the welcome channel.
2. Opens a private onboarding ticket with the member and staff.
3. Sends a structured embed with onboarding questions to understand the member's goals, experience, and how the community can help them.

### Welcome Messages
When a new member joins the server, the bot sends a welcome embed in the welcome channel with links to key channels (presentations, general, role selection, Commit+).

### Alerts
Bot warnings and errors are forwarded to a private alerts channel. Errors also tag the Staff role for immediate visibility.

---

## Commands

### Public

| Command | Description |
|---|---|
| `/help` | Shows all available public commands |
| `/ping` | Checks if the bot is online |
| `/info` | Shows detailed server information |
| `/members` | Shows the total number of members in the server |
| `/members role:<role>` | Shows the number of members with a specific role |
| `/links` | Shows all CommitPT community and creator links |
| `/me` | Shows your XP, level, and rank in the server |
| `/me membro:<user>` | Shows another member's XP, level, and rank |
| `/leaderboard` | Shows the top 10 members by XP |
| `/invites leaderboard` | Ranking of members with the most invites |
| `/invited-by membro:<user>` | Shows who invited a specific member |
| `/invites-from membro:<user>` | Shows how many members someone has invited |

### Admin-only

| Command | Description |
|---|---|
| `/setxp membro:<user> xp:<value>` | Manually set a member's total XP |
| `/log-commit-plus user:<user>` | Manually announce that a member received the Commit+ role |
| `/sell-message` | Send the Commit+ membership announcement embed |
| `/select-roles` | Post the area roles selection embed in the roles channel |
| `/select-languages` | Post the programming languages selection embed in the roles channel |
| `/setup-tickets` | Post the ticket opening embed in the tickets channel |

---

## Automated Behaviours

| Trigger | Action |
|---|---|
| Member joins the server | Welcome embed sent to the welcome channel; Programador role assigned |
| Member receives Commit+ role | Announcement sent to the welcome channel; onboarding ticket created automatically |
| Member clicks "Abrir Ticket" | Modal shown to collect subject; private ticket channel created with Staff |
| Member clicks "Fechar Ticket" | Ticket channel deleted after 3 seconds |
| Member clicks a role button | Role toggled on or off |
| Bot emits a warning | Message sent to the alerts channel |
| Bot emits an error | Message sent to the alerts channel with Staff mention |

---

## Project Structure

```
src/
├── commands/        # Slash command handlers
├── events/          # Discord event handlers
├── lib/             # Shared utilities (database, footer)
├── constants.ts     # All IDs and shared constants
├── logger.ts        # Logger with Discord alerts integration
└── index.ts         # Bot entry point, event wiring
data/
└── database.db      # SQLite database (XP, invites, ticket counter)
```

---

## Tech Stack

- **Language:** TypeScript
- **Library:** discord.js v14
- **Database:** SQLite via better-sqlite3
- **Linting:** ESLint + Prettier
- **Git hooks:** Husky + commitlint (Conventional Commits)
- **CI/CD:** GitHub Actions → SFTP to VPS

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file at the root:
```
TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_server_id
```

- `TOKEN` — found in the Discord Developer Portal under **Bot**
- `CLIENT_ID` — found in **General Information** as **Application ID**
- `GUILD_ID` — right-click your server in Discord and select **Copy Server ID** (requires Developer Mode)

### 3. Register slash commands
```bash
npm run deploy
```

### 4. Start the bot
```bash
npm run dev
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Run the bot with ts-node (development) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled bot from `dist/` |
| `npm run deploy` | Register slash commands with Discord |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format source files with Prettier |

---

## Deployment

Deployments are triggered automatically on every merge to `master` via GitHub Actions. The pipeline installs dependencies, builds the project, and transfers `dist/` to the VPS via SFTP. The bot process must be restarted manually on the VPS after each deployment.

---

## Contributing

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages must follow the format:

```
feat: add new command
fix: correct member count
chore: update dependencies
```

Before each commit, Husky automatically runs:
- ESLint + Prettier on staged files
- Commit message validation via commitlint
