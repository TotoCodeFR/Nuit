# Self-hosting Nuit

> [!NOTE]
> A CLI for Nuit is planned, but for now setup is manual.

## Table of Contents

- [Self-hosting Nuit](#self-hosting-nuit)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Development](#development)
    - [Production](#production)
  - [Environment Variables](#environment-variables)

## Prerequisites

- [Bun](https://bun.com) runtime
- [Git](https://git-scm.com)

## Installation

### Development

1. Clone the repository:

```bash
git clone https://github.com/Nuit-Bot/Nuit.git
cd Nuit
```

2. Install dependencies:

```bash
bun install
```

3. Set up your environment variables (see [Environment Variables](#environment-variables))

4. Make the database migrations:

```bash
# Better Auth migrations
bun x auth migrate

# Drizzle ORM schema migrations
bun x drizzle-kit generate
bun x drizzle-kit migrate
```

5. Run the web server (separately)

```bash
bun run dev:web
```

6. Run the bot:

- **First boot or after changing a command:**

```bash
bun run dev --register
```

- **Normal start:**

```bash
bun run dev
```

### Production

1. Clone the repository:

```bash
git clone https://github.com/Nuit-Bot/Nuit.git
cd Nuit
```

2. Install production dependencies:

```bash
bun ci
```

3. Set up your environment variables (see [Environment Variables](#environment-variables))

4. Build the source code:

```bash
bun run build # not bun build!
```

5. Make the database migrations:

```bash
# Better Auth migrations
bun x auth migrate

# Drizzle ORM schema migrations
bun x drizzle-kit generate
bun x drizzle-kit migrate
```

6. Run the bot:

- **First boot or after changing a command:**

```bash
bun run start --register
```

- **Normal start:**

```bash
bun run start
```

## Environment Variables

Create a `.env` file at the root of the project. See [.env.example](./.env.example) for reference.

```ini
DISCORD_TOKEN=your-discord-bot-token-here
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=${base_server_url}
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
```

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Bot token from the [Discord Developer Portal](https://discord.com/developers/applications) |
| `DISCORD_CLIENT_ID` | Your bot's client ID |
| `DISCORD_CLIENT_SECRET` | Your application's client secret |
| `BETTER_AUTH_SECRET` | Random secret used by Better Auth to sign cookies and tokens |
| `BETTER_AUTH_URL` | Public base URL for this app |
| `DATABASE_URL` | PostgreSQL connection string |
