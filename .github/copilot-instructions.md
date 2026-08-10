# Copilot Instructions — Pharma Inventory Backend

## Commands

```bash
npm start          # Run server (node index.js) on port 8080
npm run dev        # Run with nodemon (auto-restart on change)
```

### Linting / Formatting (Biome)

```bash
# Format a specific directory
npx @biomejs/biome format --write ./models/

# Lint and auto-fix a specific file or directory
npx @biomejs/biome lint --write ./controllers/

# Check everything
npx @biomejs/biome check .
```

Biome config: tabs for indentation, double quotes for JS strings, recommended lint rules.

## Architecture

Express.js REST API with a layered structure:

```
index.js          → app entry, route mounting, CORS config
routes/           → express Router definitions, map HTTP verbs to controller methods
controllers/      → business logic, input validation, response shaping
models/           → ES6 classes that own all SQL queries via pg Pool (database.js)
middleware/       → reqAuth.js — JWT auth guard, attaches req.user
utils/mailer.js   → nodemailer OTP email helper
token.js          → createToken(id, username, email) — signs JWT (3d expiry)
database.js       → exports { query, pool } backed by Supabase PostgreSQL
```

**Route auth pattern:** `/user/*` is public; `/medicine/*`, `/inventory/*`, `/manufacturer/*` all run through `reqAuth` middleware mounted in `index.js`.

**Database:** All tables live in the `pharma` schema on Supabase (PostgreSQL). Models call `Inventory.ensureTableExists()` to lazily create tables on first use.

**OTP flow (stateless):** The server does **not** store OTPs. `sendOtp` returns a signed HMAC token (`hash.expiresAt`) to the client; `verifyOtp` recomputes the HMAC server-side. The secret is `OTP_SECRET` env var.

## Key Conventions

### Models are ES6 classes with static query methods
- Instance methods (`addInventory`, `create_user`) perform writes.
- Static methods (`findById`, `findOne`, `searchInventory`, `deleteById`) perform reads/updates.
- Raw parameterized SQL (`$1, $2, ...`) — no ORM.

### Conflict / upsert on inventory insert
`addInventory` uses `ON CONFLICT ON CONSTRAINT unique_medicine_identity DO UPDATE` — re-adding an existing medicine **increments** `stock_quantity` rather than replacing it. The unique constraint is `(name, manufacturer_name, pack_size_label, composition1, user_name, batch_number)`.

### Soft delete via backup table
`Inventory.deleteById` runs inside a transaction: deletes from `pharma.inventory`, inserts the row into `pharma.inventory_backup` with `deleted_by` / `deleted_reason`, then commits. A rollback fires if the backup insert fails.

### Auth middleware flexibility
`reqAuth` tries several method names (`findOneByID`, `findById`, `findOneById`, `getById`, `getUserById`) to locate the user. The User model currently exports `findById` — keep that static method in place.

### Validation pattern in controllers
- Use `validator` package (`validate.isEmail`, `validate.isStrongPassword`) for input checks.
- All validation errors return `res.status(200).json({ success: false, error: "..." })` — **not** a 4xx status — to match the existing frontend contract.
- Only internal server errors return `res.status(500)`.

### JWT payload
`createToken` signs `{ id, username, email }` with `JWT_SECRET`. `reqAuth` reads `decoded.id` (with fallbacks to `userId`, `_id`, `sub`).

## Environment Variables

| Variable | Purpose |
|---|---|
| `DB_PASSWORD` | Supabase PostgreSQL password |
| `DB_SSL_REJECT_UNAUTHORIZED` | Set `false` for local dev only; defaults to `true` |
| `JWT_SECRET` | Signs/verifies JWT tokens |
| `OTP_SECRET` | HMAC key for stateless OTP tokens |
| `CORS_ORIGINS` | Comma-separated allowed origins (default: `http://localhost:5173`) |
