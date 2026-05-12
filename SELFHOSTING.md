# Self-hosting Nuit

## Prerequisites

- [Bun](https://bun.com) runtime
- [Git](https://git-scm.com)

## Installation
>
> [!NOTE]
> A CLI for Nuit usage will be released someday, but for now, it's all manual.

- [Self-hosting Nuit](#self-hosting-nuit)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Development](#development)
    - [Production](#production)
  - [Environment Variables](#environment-variables)

### Development

1. Clone the repository:

```bash
git clone https://github.com/Nuit-Bot/Nuit.git
```

2. CD into the app:

```bash
cd Nuit
```

3. Install dependencies:

```bash
bun install
```

3. Set up your environment variables (see section [Environment Variables](#environment-variables))

4. Run the bot in development mode:

- **First boot or when changing a command**:

```bash
bun run dev --register
```

- Normal start:

```bash
bun run dev
```

### Production

For production environments, we recommend using `bun ci` to install only production dependencies:

1. Clone the repository:

```bash
git clone https://github.com/Nuit-Bot/Nuit.git
```

2. CD into the app:

```bash
cd Nuit
```

3. Install dependencies:

```bash
bun ci
```

3. Set up your environment variables (see section [Environment Variables](#environment-variables))

4. Run the bot in production mode:

- **First boot or when changing a command**:

```bash
bun run start --register
```

- Normal start:

```bash
bun run start
```

## Environment Variables

Put the following environment variables in your `.env` file:

- `DISCORD_TOKEN`: Your Discord bot token from the Discord Developer Portal
- `DISCORD_CLIENT_ID`: Your Discord bot's client ID
- `DISCORD_CLIENT_SECRET`: Your Discord application's client secret
- `BETTER_AUTH_SECRET`: A random secret used by Better Auth to sign cookies and tokens
- `BETTER_AUTH_URL`: The public base URL for this app
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase secret key (MUST BE SECRET KEY, found in Supabase dashboard > Settings > API Keys)
- `DATABASE_URL`: Your PostgreSQL connection string

They must be formatted like the following:

```ini
DISCORD_TOKEN=your-discord-bot-token-here
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=${base_server_url}
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```
