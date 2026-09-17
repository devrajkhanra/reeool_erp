# Reeool ERP API

A NestJS backend for the Reeool ERP platform, built around JWT authentication and organization-scoped tenant access.

## Overview

This service exposes the core API for:

- user registration and login
- organization creation and management
- authenticated access using JWT bearer tokens
- tenant context propagation via verified JWT claims

The API is served by NestJS and exposes Swagger documentation at:

- http://localhost:3000/api/docs

## Tech stack

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL-compatible database
- JWT authentication with Passport
- Swagger/OpenAPI
- class-validator and class-transformer

## Requirements

Before starting the API, make sure you have:

- Node.js 20+
- pnpm installed
- a PostgreSQL-compatible database available
- environment variables configured

## Environment variables

Create a `.env` file in the project root with values similar to:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/reeool_erp"
JWT_SECRET="replace-this-with-a-long-random-secret-at-least-32-chars"
JWT_EXPIRES_IN="1d"
PORT=3000
NODE_ENV="development"
```

The application validates these values at startup using Joi, and it refuses to boot if `DATABASE_URL` or `JWT_SECRET` are missing or invalid.

## Installation

```bash
pnpm install
```

## Run locally

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production build
pnpm run build
pnpm run start:prod
```

## API documentation

Once the app is running, view the generated Swagger docs here:

```text
http://localhost:3000/api/docs
```

## Authentication model

The entire API is protected by a global JWT guard unless a route explicitly marks itself as public.

- Public endpoints: `/auth/register`, `/auth/login`
- Protected endpoints: all other routes
- Authorization header format:

```http
Authorization: Bearer <jwt>
```

The JWT payload includes:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "OWNER",
  "organizationId": "organization-id"
}
```

The verified `organizationId` is stored in request context and used for tenant-aware access.

## Endpoints

### 1) Health

#### GET /

Returns a simple application greeting.

Example response:

```json
{
  "message": "Hello World!"
}
```

---

### 2) Authentication

#### POST /auth/register

Creates a new user account.

Public access.

Request body:

```json
{
  "email": "founder@example.com",
  "password": "password123",
  "firstName": "Ada",
  "lastName": "Lovelace"
}
```

Validation rules:

- `email`: valid email, required
- `password`: string, minimum 8 characters, required
- `firstName`: string, required
- `lastName`: string, required

Success response: `201 Created`

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

Possible errors:

- `409 Conflict`: a user with the same email already exists

#### POST /auth/login

Authenticates a user and returns a JWT.

Public access.

Request body:

```json
{
  "email": "founder@example.com",
  "password": "password123"
}
```

Success response: `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Possible errors:

- `401 Unauthorized`: invalid credentials

---

### 3) Organizations

All organization routes require authentication.

#### POST /organizations

Creates a new organization for the currently authenticated user.

Requires `Authorization: Bearer <token>`.

Request body:

```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "taxId": "US123456789"
}
```

Validation rules:

- `name`: string, required
- `slug`: string, required; used as a URL-friendly identifier
- `taxId`: optional string

Success response: `201 Created`

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

Behavior:

- verifies the current user exists
- rejects users who already belong to an organization
- creates the organization
- updates the founder user to `role: "OWNER"`
- sets the founder's `organizationId`

Possible errors:

- `403 Forbidden`: only registered users may create an organization
- `409 Conflict`: slug already exists or user already belongs to an organization

#### GET /organizations

Fetches the organization associated with the authenticated user.

Requires `Authorization: Bearer <token>`.

Success response: `200 OK`

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

Possible errors:

- `404 Not Found`: user is not attached to any organization

#### PATCH /organizations

Updates the authenticated user's organization details.

Requires `Authorization: Bearer <token>`.

Only organization owners may update the organization.

Request body:

```json
{
  "name": "Acme Corporation",
  "slug": "acme-corporation",
  "taxId": "US987654321"
}
```

Any subset of fields may be sent.

Success response: `200 OK`

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

Possible errors:

- `403 Forbidden`: only the organization owner may update details
- `404 Not Found`: user does not belong to an organization
- `409 Conflict`: slug already exists

---

## Response conventions

The app uses a global response transform interceptor, so successful responses are normalized and wrapped consistently before reaching the client.

Errors are handled by a global HTTP exception filter and are returned in a NestJS-style structured format based on the thrown exception type.

## Validation and security notes

- All incoming request bodies are validated globally using `ValidationPipe({ whitelist: true, transform: true })`.
- Unknown fields are stripped from payloads automatically.
- JWT validation happens before protected routes are executed.
- The app rejects booting without a strong `JWT_SECRET`.
- Tenant context is injected only from the verified JWT, not from client headers.

## Tests

```bash
pnpm test
pnpm run test:e2e
pnpm run test:cov
```

## Prisma contract and migrations

This project uses Prisma 8 contract-style configuration.

Useful commands:

```bash
pnpm run contract:emit
```

Migrations live in the `migrations/` folder and are part of the database lifecycle for this service.

## License

This project is currently set to an unlicensed internal workspace setup and may be updated as the project matures.
