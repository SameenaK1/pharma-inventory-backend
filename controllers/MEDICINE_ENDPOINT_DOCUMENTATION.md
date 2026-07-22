# Pharma Inventory Backend

A backend server for pharmaceutical inventory management with user authentication and medicine search capabilities.

## Features

- User authentication (sign up and login)
- Medicine management (add medicines)
- Medicine name search functionality
- PostgreSQL database integration
- CORS enabled for cross-origin requests

## API Endpoints

### Medicine Endpoints

#### POST /medicine/add-medicine
Add a new medicine to the database.

**Request Body:**
```json
{
  "idnum": 1,
  "name": "Medicine Name",
  "manufacturer_name": "Manufacturer Name",
  "type": "Tablet",
  "pack_size_label": "10 tablets",
  "composition1": "Active Ingredient 1",
  "composition2": "Active Ingredient 2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Medicine added successfully",
  "insertedId": 1
}
```

#### GET /medicine/medicine-name?name=<search_term>
Search for medicines by name.

**Query Parameters:**
- `name` (required): Search term to match against medicine names

**Response:**
```json
{
  "success": true,
  "message": "Found X medicine(s) matching 'search_term'",
  "data": [
    {
      "id": 1,
      "name": "Medicine Name",
      "manufacturer_name": "Manufacturer Name",
      "type": "Tablet",
      "pack_size_label": "10 tablets",
      "composition1": "Active Ingredient 1",
      "composition2": "Active Ingredient 2"
    }
  ]
}
```

## Database Schema

### Medicine Table (medicine_raw)
```sql
CREATE TABLE IF NOT EXISTS medicine_raw (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  manufacturer_name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  pack_size_label VARCHAR(100),
  composition1 TEXT,
  composition2 TEXT
);
```

### User Table (user)
```sql
CREATE TABLE IF NOT EXISTS user (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  lastLogin TIMESTAMP WITH TIME ZONE,
  loggedIn BOOLEAN DEFAULT FALSE,
  loginCount INT DEFAULT 0
);
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create .env file):
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_DATABASE=pharma
   DB_PASSWORD=password
   DB_PORT=5432
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Development

For development with auto-restart:
```bash
npm run dev
```

## Testing

The server will be available at `http://localhost:8080/`

### Example API Calls

1. Search for medicines containing "Cet":
   ```bash
   curl "http://localhost:8080/medicine/medicine-name?name=Cet"
   ```

2. Search for medicines containing "Par":
   ```bash
   curl "http://localhost:8080/medicine/medicine-name?name=Par"
   ```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400: Bad Request (invalid input)
- 404: Not Found (no medicines match the search term)
- 500: Internal Server Error (database or server issues)

## Search Functionality

The medicine search endpoint:
- Performs case-insensitive matching
- Returns partial matches (e.g., searching for "Cet" will return "Cetanil-T", "Cetanil-M", etc.)
- Requires a minimum of 2 characters for search
- Returns results ordered by medicine name alphabetically