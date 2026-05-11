# Nuit Discord Bot - Agent Instructions

See README.md for general setup and CONTRIBUTING.md for code style guidelines.

## Key Technologies

- Runtime: Bun (not Node.js)
- Language: TypeScript
- Framework: Discord.js v14
- Database: PostgreSQL via Drizzle ORM
- Auth: Better Auth with Discord OAuth
- Web: Express 5 with Helmet
- Config: TOML format
- Formatter: Prettier (4-space tabs, double quotes)

## Architecture

The bot uses a module-based architecture. Everything loads through `src/main.ts` which imports both the Discord client and Express server.

### Module System

Modules live in `src/modules/[name]/` and can also come from external registries (installed to `registry-modules/`). Each module requires:

- `package.json` with `name`, `main` (entry file path), and optional `nuit.kind` field
- Entry file (e.g., `main.ts`) that exports an async `setup(ctx: ModuleContext)` function

Commands and events are registered inside `setup()` using the context API:

```typescript
ctx.api.registerCommand({ data: SlashCommandBuilder, execute: handler });
ctx.api.onEvent(Events.GuildCreate, handler);
ctx.api.onceEvent(Events.ClientReady, handler, { guildScoped: false });
```

Existing modules:

- `src/modules/main/` - Core commands (/ping) and guild management events
- `src/modules/moderation/` - Moderation features

### Directory Ownership

- `src/discord/` - Discord client setup, module loader, registry manager, utilities
- `src/server/` - Express server, auth routes, dashboard
- `src/db/` - Drizzle schema and database connection
- `src/modules/` - Feature modules (commands + events)
- `src/utility/` - Shared utilities (cache, config loader)
- `src/web/` - Static web dashboard files
- `src/lib/` - Library code (auth configuration)

## Essential Commands

- `bun install` - Install all dependencies
- `bun ci` - Install production dependencies only
- `bun run dev` - Development mode with file watching
- `bun run dev --register` - Dev mode + push commands to Discord API (use after adding/modifying commands)
- `bun run start` - Production mode
- `bun run start --register` - Production mode + push commands to Discord API

## Environment Variables

Required in `.env`:

- `DISCORD_TOKEN` - Bot token
- `DISCORD_CLIENT_ID` - Bot client ID
- `DISCORD_CLIENT_SECRET` - OAuth client secret
- `BETTER_AUTH_SECRET` - Auth cookie/token signing secret
- `BETTER_AUTH_URL` - Public base URL for the app
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase secret key (not anon key)
- `DATABASE_URL` - PostgreSQL connection string

## Configuration

TOML config loading priority: `config.private.toml` > `config.toml` > `config.example.toml`

Key config fields:

- `host.hosters` - Trusted user IDs who can run admin commands
- `host.allow_command_reloading` - Whether non-hosters can reload commands
- `host.allow_external_modules` - Enable external registry modules (requires Git)
- `registries` - Array of module catalogs with `raw` (URL) or `path` (local file)

## Important Notes

- Commands are registered with Discord API at startup when `--register` flag is passed
- Module commands are cached in `globalRegistry` (moduleLoader.ts)
- External modules are git-cloned to `registry-modules/` with a `registry.lock` file tracking commits
- Server defaults to port 8080 (override with `PORT` env var)
- Bot requires Guilds, GuildMessages, and MessageContent intents
- Guild-scoped events check `guild_modules` table for enabled status (60s TTL cache)
- Drizzle migrations live in `better-auth_migrations/`

## Gotchas

- Never use `ephemeral: true` - use `flags: MessageFlags.Ephemeral` instead
- Module entry files must export `setup` - missing it logs a warning and skips the module
- Modules without valid `package.json` (missing `name` or `main`) are skipped at startup
- External modules require Git in PATH - disabled by default in production config
- The `--register` flag is needed whenever command `data` definitions change
- PRs that are entirely AI-generated will be closed
