# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Run with ts-node (development)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled bot from dist/
npm run deploy       # Register slash commands with Discord
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier on src/
```

> There are no automated tests in this project.

## Architecture

The bot is built with **discord.js v14** and TypeScript. Entry point is `src/index.ts`, which wires up all commands and events onto a single `Client` instance.

### Adding a command

1. Create `src/commands/<name>.ts` — export `data` (a `SlashCommandBuilder`) and `execute(interaction)`.
2. Import it in `src/index.ts` and add it to the `commands` array.
3. Import it in `src/deploy-commands.ts` and add `<name>.data` to the `commands` array.
4. Run `npm run deploy` to register it with Discord.

### Adding an event

1. Create `src/events/<eventName>.ts` — export a `handle*` function.
2. Import and wire it in `src/index.ts` via `bot.on('<event>', ...)`.

### Logging

Use `logger` from `src/logger.ts` instead of `console.*`. Available levels: `info`, `warn`, `error`, `debug`, `success`. All output includes an ISO timestamp and a colored level prefix. Use bracket-prefixed context tags in messages (e.g. `[guildMemberAdd]`) for easy filtering.

### Role assignment

`assignProgrammerRole` in `src/events/guildMemberAdd.ts` is a shared utility for assigning the Programador role (`1519017947589382154`). It is called both on `guildMemberAdd` and `messageCreate`. Reuse this pattern for any future role-assignment logic.

### Environment variables

| Variable | Description |
|---|---|
| `TOKEN` | Discord bot token |
| `CLIENT_ID` | Discord application ID |
| `GUILD_ID` | Discord server ID |
| `WELCOME_CHANNEL_ID` | Channel for welcome and Commit+ announcements |
| `PRESENTATIONS_CHANNEL_ID` | Channel linked in welcome message |
| `GENERAL_CHANNEL_ID` | Channel linked in welcome message |
| `COMMIT_PLUS_CHANNEL_ID` | Channel linked in welcome message |

### Deployment

The bot runs on a VPS. Deployments are **manual and owner-only**: build locally (`npm run build`), then transfer the `dist/` folder to the VPS via SFTP and restart the bot process.

## Commit messages

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint + Husky. Format: `type: description` (e.g. `feat: add new command`, `fix: correct member count`).
