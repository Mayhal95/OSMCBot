# OSMC Discord Bot

The official Discord bot foundation for the **Obsidian Serpents Motorcycle Club** in NoKey FiveM.

The bot is built with TypeScript, discord.js, and Discord Components V2. Every user-facing bot response uses the shared OSMC visual system:

- Primary: `#2A213A`
- Secondary: `#000000`
- Club mark: `assets/branding/osmc-logo.png`

## Requirements

- Node.js 22.12 or newer
- A Discord application and bot token
- A Discord server where you can install the bot

## First-time setup

The Discord application has not been created yet. Follow [the Developer Portal setup guide](docs/DEVELOPER-PORTAL-SETUP.md), then:

1. Copy `.env.example` to `.env`.
2. Add the bot token, application ID, and development server ID.
3. Install dependencies with `npm install`.
4. Register the slash commands with `npm run commands:deploy`.
5. Start the development bot with `npm run dev`.

Never commit `.env` or share the bot token.

## Commands included

- `/about` — Displays the club identity and initial bot information.
- `/ping` — Confirms that the bot and Discord connection are healthy.

## Useful scripts

| Command                   | Purpose                                     |
| ------------------------- | ------------------------------------------- |
| `npm run dev`             | Run the bot locally with automatic restarts |
| `npm run commands:deploy` | Register slash commands with Discord        |
| `npm run check`           | Type-check the project                      |
| `npm run lint`            | Run static code checks                      |
| `npm run test`            | Run the automated tests                     |
| `npm run build`           | Compile the production build                |
| `npm start`               | Run the compiled production build           |

## Project layout

```text
assets/branding/       OSMC brand assets
docs/                  Setup and operating guides
src/commands/          Slash command modules
src/config/            Environment and theme configuration
src/ui/                Reusable Components V2 layouts
src/index.ts           Bot startup and interaction routing
src/register-commands.ts  Slash command registration
tests/                 Automated tests
```

## Components V2 standard

New features should build responses with the helpers in `src/ui`. Do not add legacy embeds or plain message responses. Centralizing the layout keeps the purple accent, typography, spacing, and error states consistent across the bot.
