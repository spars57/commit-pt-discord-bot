# Commit PT Bot

A Discord bot for the Commit PT server, built with TypeScript and discord.js v14.

---

## Commands

| Command | Description |
|---|---|
| `/ping` | Checks if the bot is online |
| `/members` | Shows the total number of members in the server |
| `/members role:Commit+` | Shows the number of members with a specific role |
| `/info` | Shows detailed information about the server |

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

> **Note:** Only the owner has SFTP access to the VPS. There is no automated CI/CD pipeline for deployments.

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
