# Commit PT Bot

A Discord bot for the Commit PT server, built with TypeScript and discord.js v14.

---

## Commands

### Public commands

| Command | Description |
|---|---|
| `/help` | Shows all available bot commands |
| `/ping` | Checks if the bot is online |
| `/info` | Shows detailed server information |
| `/members` | Shows the total number of members in the server |
| `/members role:<role>` | Shows the number of members with a specific role |
| `/links` | Shows all CommitPT community and creator links |
| `/rank` | Check your level and XP in the server |
| `/rank member:<user>` | Check another member's level and XP |
| `/leaderboard` | Shows the top 10 members by XP |
| `/invites leaderboard` | Ranking of members with the most invites |
| `/invited-by member:<user>` | Shows who invited a member |
| `/invites-from member:<user>` | Shows how many members someone has invited |

### Admin-only commands

| Command | Description |
|---|---|
| `/log-commit-plus user:<user>` | Announce that a member has received the Commit+ role |
| `/sell-message` | Send the Commit+ membership announcement embed |
| `/setxp member:<user> xp:<value>` | Set a member's total XP |
| `/select-roles` | Post the area roles selection embed with buttons |
| `/select-languages` | Post the programming languages roles selection embed with buttons |
| `/setup-tickets` | Post the ticket opening embed in the tickets channel |

---

## Tech Stack

- **Language:** TypeScript
- **Library:** discord.js v14
- **Linting:** ESLint + Prettier
- **Git hooks:** Husky + commitlint (Conventional Commits)
- **CI:** GitHub Actions

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
| `npm run dev` | Run the bot with ts-node |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled bot |
| `npm run deploy` | Register slash commands with Discord |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format source files with Prettier |

---

## Deployment

The bot is hosted on a **VPS** and must be deployed manually by the owner.

### Steps to deploy

1. Build the project locally:
   ```bash
   npm run build
   ```
2. Connect to the VPS via **SFTP** and transfer the `dist/` folder to the server.
3. Restart the bot process on the VPS.

> **Note:** Deployments are triggered automatically via GitHub Actions on every merge to `master`. The pipeline builds the project and transfers `dist/` to the VPS via SFTP. The bot process must be restarted manually on the VPS after deployment.

---

## Contributing

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages must follow the format:

```
feat: add new command
fix: correct member count
chore: update dependencies
```

Before each commit, Husky will automatically run:
- TypeScript type checking
- ESLint + Prettier on staged files
- Commit message validation
