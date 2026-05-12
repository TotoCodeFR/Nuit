# Nuit

Nuit is a Discord bot built with TypeScript and Discord.js. The bot features a modular architecture with dynamic command and event loading capabilities. It supports slash commands and is designed to be easily extensible.

## Features

- Modular architecture with dynamic command and event loading
- Support for slash commands
- Built with TypeScript for type safety
- Uses Bun runtime for fast execution
- Supabase integration for database operations
- Chalk for colorful console logging

## Installation

See [SELFHOSTING.md](./SELFHOSTING.md).

## Adding Commands

To add a new slash command:

1. Create a new file in the `src/discord/commands/[category]/` directory
2. Follow the structure of the ping command as a template
3. Export a default object with `data` (SlashCommandBuilder) and `execute` (interaction handler)

## Contributing

We welcome contributions from the community. Please read our [contributing guidelines](./CONTRIBUTING.md) for more information on how to get involved with this project.

Note that we may take longer to review pull requests depending on their size - larger PRs require more time to properly evaluate.
