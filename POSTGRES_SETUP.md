# PostgreSQL Database Setup Guide

This guide details the steps to set up, migrate, and seed the PostgreSQL database for the HUSTLR application in both local development and production environments.

---

## 1. Local Development Setup

To run PostgreSQL locally, you can choose between running PostgreSQL inside a **Docker Container** (recommended) or performing a **Native System Installation**.

### Option A: Running with Docker (Recommended)

1. Ensure you have **Docker Desktop** installed and running on your system.
2. Start a PostgreSQL container with a default database:
   ```bash
   docker run --name hustlr-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hustlr -p 5432:5432 -d postgres:15
   ```
3. Set your local environment variable inside `.env` in the workspace root:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hustlr?schema=public"
   ```

### Option B: Native PostgreSQL Installation

1. Download and run the installer from the [Official PostgreSQL Downloads Page](https://www.postgresql.org/download/).
2. During the setup wizard, configure the superuser account password (e.g., `admin`).
3. Connect using `pgAdmin` or the `psql` command-line utility and create the target database:
   ```sql
   CREATE DATABASE hustlr;
   ```
4. Set your local environment variable inside `.env` in the workspace root:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hustlr?schema=public"
   ```

---

## 2. Production Deployment Setup

For production deployments, it is recommended to use managed PostgreSQL providers that offer automatic scaling, daily backups, and connection pooling.

### Recommended Cloud Providers
- **Neon.tech**: Serverless PostgreSQL featuring instant database branching and built-in connection pooling.
- **Supabase**: Open-source Firebase alternative providing a fully managed PostgreSQL instance on top of AWS.
- **AWS RDS / GCP Cloud SQL**: Enterprise-ready relational databases suitable for custom VM scaling.

### Setting Up Connection String with Pooling

For serverless deployments (e.g., Vercel, Render, AWS Lambda), always use connection pooling to prevent database connection limits from being exhausted.
- **Direct Database URL** (used for Prisma migrations):
  ```env
  DATABASE_URL="postgresql://username:password@pg-host:5432/hustlr?sslmode=require"
  ```
- **Connection Pooled URL** (used by the active Express server for standard queries):
  ```env
  DATABASE_URL_POOL="postgresql://username:password@pg-host:6543/hustlr?sslmode=require&pgbouncer=true"
  ```

---

## 3. Database Migrations and Seeding

Once you have set up a database and updated your `DATABASE_URL` in the `.env` file, run the initialization commands.

### Initialize Schema & Run Migrations

Run the Prisma CLI to generate the database tables matching the HUSTLR production schema:
```bash
npx prisma migrate dev --name init
```

### Seed Indian Builder Data

Initialize the database with high-quality Indian student builders (Dhruv C., Sneha R., Priya Patel, Karan J.), curated opportunities, active workspaces, and community forum posts:
```bash
npx prisma db seed
```

This runs the custom seed script located at [seed.ts](file:///c:/Users/dhruv/Downloads/hustlr/backend/src/prisma/seed.ts) and fully populates your database workspace.
