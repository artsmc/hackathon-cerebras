# Prisma Database Management Guide

This document provides instructions for generating, migrating, and updating the database using Prisma in the PolicyGlass project.

## Database Configuration

The project uses **SQLite** as its database provider. The database configuration is set in the `.env` file:

```env
DATABASE_URL="file:./prisma/dev.db"
```

The Prisma schema is located at `policyglass/prisma/schema.prisma`.

## Prisma Client Generation

To generate the Prisma client based on the current schema:

```bash
cd policyglass
npx prisma generate
```

This command generates the TypeScript client code in `policyglass/src/generated/prisma/` as configured in the schema:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
```

## Database Migrations

### Creating a New Migration

When you make changes to the Prisma schema, create a new migration:

```bash
cd policyglass
npx prisma migrate dev --name migration_name
```

This command will:
1. Create a new migration file in `policyglass/prisma/migrations/`
2. Apply the migration to the database
3. Generate the Prisma client

### Applying Migrations to Database

To apply pending migrations to the database:

```bash
cd policyglass
npx prisma migrate deploy
```

### Viewing Migration Status

To check the status of migrations:

```bash
cd policyglass
npx prisma migrate status
```

## Schema Updates Process

1. **Modify the schema**: Edit `policyglass/prisma/schema.prisma` to add/modify models or fields
2. **Create migration**: Run `npx prisma migrate dev --name descriptive_name` 
3. **Review generated SQL**: Check the migration SQL file in `policyglass/prisma/migrations/`
4. **Test changes**: Verify the migration worked correctly
5. **Commit changes**: Include both the schema changes and migration files in your commit

## Current Database Models

### User
- Authentication and session management
- Role-based access control
- Password security tracking

### Policy
- Stores company policy documents
- Links to audit reports and jobs

### AuditReport
- Contains audit results for policies
- Links to section scores and saved reports

### PolicyJob
- Tracks asynchronous policy processing jobs
- Manages research and audit phases
- Handles job status and progress

## Best Practices

- Always create migrations when changing the schema
- Use descriptive migration names that explain the changes
- Review generated SQL before applying to production
- Keep the Prisma schema as the single source of truth for database structure
- Use Prisma's type-safe queries instead of raw SQL when possible

## Common Operations

### Reset Database (Development Only)
```bash
cd policyglass
npx prisma migrate reset
```

### Seed Database
Create a seed script in `policyglass/prisma/seed.ts` and run:
```bash
cd policyglass
npx prisma db seed
```

### Database Studio
Open Prisma Studio for database browsing:
```bash
cd policyglass
npx prisma studio
