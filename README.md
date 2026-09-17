# Reeool ERP API

Production-grade NestJS backend for the Reeool ERP platform.

## Architecture

This service is structured around a strict multi-tenant model:

- all routes are protected by default via a global JWT guard
- only explicitly public routes can be accessed without authentication
- user identity is derived from the verified JWT payload
- organization context is enforced from the token, not from client headers
- users are created as founders by default during public registration, and then may later be invited or managed within an organization

## Core rules

1. Public registration creates a founder account with the `OWNER` role.
2. Members are not allowed to self-register.
3. Only authenticated users may create or manage organizations.
4. A user may belong to at most one organization.
5. Organization updates are restricted to the current owner.
6. JWT claims carry `sub`, `email`, `role`, and `organizationId`.

## Tech stack

- NestJS 12
- TypeScript
- Prisma 8 contract-based ORM
- PostgreSQL-compatible database
- Passport + JWT
- Swagger/OpenAPI
- class-validator + class-transformer
- Argon2 password hashing

## Environment

Create a `.env` file:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/reeool_erp"
JWT_SECRET="replace-this-with-a-long-random-secret-at-least-32-chars"
JWT_EXPIRES_IN="1d"
PORT=3000
NODE_ENV="development"
```

Startup validation requires `DATABASE_URL` and `JWT_SECRET` to be present and valid.

## Local setup

```bash
pnpm install
pnpm run start:dev
```

Production:

```bash
pnpm run build
pnpm run start:prod
```

Swagger UI:

```text
http://localhost:3000/api/docs
```

## Authentication model

Public routes:

- `POST /auth/register`
- `POST /auth/login`

Protected routes:

- all other endpoints

Authorization header:

```http
Authorization: Bearer <jwt>
```

JWT payload:

```json
{
  "sub": "user-id",
  "email": "founder@example.com",
  "role": "OWNER",
  "organizationId": "organization-id"
}
```

## API reference

### GET /

Health check endpoint.

Response:

```json
{
  "message": "Hello World!"
}
```

### POST /auth/register

Creates a new founder account. This route is public and intentionally assigns `role: "OWNER"`.

Request body:

```json
{
  "email": "founder@example.com",
  "password": "password123",
  "firstName": "Ada",
  "lastName": "Lovelace"
}
```

Rules:

- `email` must be a valid email
- `password` must be at least 8 characters
- `firstName` and `lastName` are required

Success response `201`:

```json
{
  "id": "user-id",
  "email": "founder@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "role": "OWNER",
  "isActive": true,
  "organizationId": null,
  "createdAt": "2026-09-17T00:00:00.000Z",
  "updatedAt": "2026-09-17T00:00:00.000Z"
}
```

Errors:

- `409 Conflict`: a user with the same email already exists

### POST /auth/login

Authenticates an existing user and returns a signed JWT.

Request body:

```json
{
  "email": "founder@example.com",
  "password": "password123"
}
```

Success response `200`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Errors:

- `401 Unauthorized`: invalid credentials

### POST /organizations

Creates a new organization for the authenticated user.

Authorization required.

Request body:

```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "taxId": "US123456789"
}
```

Behavior:

- validates that the requesting user exists
- rejects users already attached to an organization
- creates the organization
- sets the founder user to `OWNER`
- attaches the organization to the founder

Success response `201`:

```json
{
  "id": "organization-id",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "taxId": "US123456789",
  "settings": null,
  "isActive": true,
  "createdAt": "2026-09-17T00:00:00.000Z",
  "updatedAt": "2026-09-17T00:00:00.000Z"
}
```

Errors:

- `403 Forbidden`: user cannot create an organization
- `409 Conflict`: slug already exists or user already has an organization

### GET /organizations

Returns the organization bound to the authenticated user.

Success response `200`:

```json
{
  "id": "organization-id",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "taxId": "US123456789",
  "settings": null,
  "isActive": true,
  "createdAt": "2026-09-17T00:00:00.000Z",
  "updatedAt": "2026-09-17T00:00:00.000Z"
}
```

Errors:

- `404 Not Found`: user is not attached to an organization

### PATCH /organizations

Updates the current organization. Only the owner can modify it.

Request body example:

```json
{
  "name": "Acme Corporation",
  "slug": "acme-corporation",
  "taxId": "US987654321"
}
```

Success response `200`:

```json
{
  "id": "organization-id",
  "name": "Acme Corporation",
  "slug": "acme-corporation",
  "taxId": "US987654321",
  "settings": null,
  "isActive": true,
  "createdAt": "2026-09-17T00:00:00.000Z",
  "updatedAt": "2026-09-17T12:00:00.000Z"
}
```

Errors:

- `403 Forbidden`: only the organization owner may update it
- `404 Not Found`: user does not belong to an organization
- `409 Conflict`: slug already exists

## Security and validation

- requests are validated globally with `ValidationPipe({ whitelist: true, transform: true })`
- unknown payload properties are stripped before processing
- JWTs are verified before protected endpoints run
- tenant context is only taken from the verified JWT payload
- password hashes are stored using Argon2

## Tests

```bash
pnpm test
pnpm run test:e2e
pnpm run test:cov
```

## Prisma and migrations

```bash
pnpm run contract:emit
```

Migrations are stored under the `migrations/` directory and should be treated as part of the release process.

## License

This project is currently configured as internal/internal workspace code and does not declare a public license yet.
