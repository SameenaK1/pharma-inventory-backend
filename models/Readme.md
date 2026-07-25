# Models Documentation

This document provides comprehensive documentation for all model files in the `pharma-inventory-backend/models` directory.

## Directory Structure

```
models/
├── README.md                           # This documentation file
├── inventory.js                        # Inventory management model
├── manufacturer.js                      # Manufacturer search model
├── medicine.js                         # Medicine catalog model
├── medicine.mock.js                    # Mock medicine model for testing
└── user.js                             # User management model
```

## Model Files Overview

### 1. inventory.js
**Purpose**: Handles all inventory-related database operations including CRUD operations, search functionality, and backup management.

**Class**: `Inventory`

**Constructor Parameters**:
- `name` (string) - The name of the medicine
- `manufacturerName` (string) - The name of the manufacturer  
- `type` (string) - The type/category of medicine
- `packSizeLabel` (string) - The label for the pack size
- `composition1` (string) - First composition ingredient
- `composition2` (string) - Second composition ingredient
- `mrp` (number) - Maximum Retail Price
- `stockQuantity` (number) - Current stock quantity
- `purchasePrice` (number) - Purchase price per unit
- `sellingPrice` (number) - Selling price per unit
- `stockAlertThreshold` (number) - Threshold for stock alerts
- `expiryDate` (Date) - Expiry date of the medicine
- `userName` (string) - Username associated with the record
- `insertDate` (Date) - Date when the record was inserted
- `updateDate` (Date) - Date when the record was last updated

**Static Methods**:

#### `ensureTableExists()`
- **Purpose**: Ensures the inventory table exists in the database
- **Type**: Static method
- **Returns**: `Promise<void>`
- **Throws**: Error if table creation fails
- **Details**: Creates the `pharma` schema and `inventory` table if they don't exist

#### `searchInventory(searchParams, userOrderBy, page, limit)`
- **Purpose**: Searches inventory records with filtering, sorting, and pagination
- **Type**: Static method
- **Parameters**:
  - `searchParams` (Object) - Search criteria object with optional fields: name, manufacturer_name, type, composition1, composition2
  - `userOrderBy` (string) - Field to sort results by (default: 'name')
  - `page` (number) - Page number for pagination (default: 1)
  - `limit` (number) - Number of records per page (default: 50)
- **Returns**: Promise with object containing:
  - `data` (Array) - Array of inventory records
  - `pagination` (Object) - Pagination metadata
- **Features**: Case-insensitive search, pagination metadata, safe column validation

#### `deleteById(id, deletedBy, deletedReason)`
- **Purpose**: Deletes an inventory item and creates a backup record
- **Type**: Static method
- **Parameters**:
  - `id` (number) - ID of the inventory item to delete
  - `deletedBy` (string) - User who performed the deletion (default: 'system')
  - `deletedReason` (string) - Reason for deletion (default: 'User Request')
- **Returns**: Promise<number> - Number of records deleted (1 or 0)
- **Features**: Transaction-based deletion, automatic backup creation, rollback on failure

**Instance Methods**:

#### `addInventory()`
- **Purpose**: Adds or updates an inventory record in the database
- **Type**: Instance method
- **Returns**: Promise<Object> - Database query result with the saved/updated record
- **Features**: 
  - Automatic table existence check
  - Upsert functionality using ON CONFLICT
  - Stock quantity increment on duplicate
  - Automatic timestamp updates

---

### 2. user.js
**Purpose**: Handles user-related database operations including authentication and user management.

**Class**: `User`

**Constructor Parameters**:
- `name` (string) - Full name of the user
- `username` (string) - Username for login
- `email` (string) - Email address for login
- `password` (string) - Hashed password

**Static Methods**:

#### `ensureTableExists()`
- **Purpose**: Ensures the user table exists in the database
- **Type**: Static method
- **Returns**: `Promise<void>`
- **Details**: Creates the `pharma` schema and `user` table if they don't exist

#### `findOne(email)`
- **Purpose**: Finds a user by email address
- **Type**: Static method
- **Parameters**: `email` (string) - Email address to search for
- **Returns**: Promise<Object> - Database query result with user data
- **Details**: Returns id, password, and username for the given email

#### `findOneByID(id)`
- **Purpose**: Finds a user by ID
- **Type**: Static method
- **Parameters**: `id` (number) - User ID to search for
- **Returns**: Promise<Object> - Database query result with user data
- **Details**: Returns id, password, and username for the given ID

#### `logged_in(email)`
- **Purpose**: Updates user login status
- **Type**: Static method
- **Parameters**: `email` (string) - Email address of the user
- **Returns**: Promise<Object> - Database query result
- **Features**: Updates lastLogin timestamp, sets loggedIn to true, increments loginCount

#### `log_out(id)`
- **Purpose**: Logs out a user
- **Type**: Static method
- **Parameters**: `id` (number) - User ID to log out
- **Returns**: Promise<Object> - Database query result
- **Features**: Sets loggedIn to false

**Instance Methods**:

#### `create_user()`
- **Purpose**: Creates a new user record in the database
- **Type**: Instance method
- **Returns**: Promise<Object> - Database query result with the created user
- **Features**: 
  - Automatic table existence check
  - Returns the created user data

---

### 3. manufacturer.js
**Purpose**: Handles manufacturer-related database operations and search functionality.

**Class**: `Manufacturer`

**Constructor Parameters**:
- `id` (number) - Manufacturer ID
- `name` (string) - Manufacturer name

**Static Methods**:

#### `ensureTableExists()`
- **Purpose**: Ensures the manufacturer table exists in the database
- **Type**: Static method
- **Returns**: `Promise<void>`
- **Details**: Creates the `pharma` schema and `manufacturer_names` table if they don't exist

#### `searchManufacturerNames(searchTerm)`
- **Purpose**: Searches for manufacturer names
- **Type**: Static method
- **Parameters**: `searchTerm` (string) - Search term for manufacturer names
- **Returns**: Promise<Array> - Array of manufacturer objects
- **Features**: 
  - Case-insensitive search
  - Results ordered by name
  - Limited to 50 results for performance
  - Returns id and name fields

---

### 4. medicine.js
**Purpose**: Handles medicine catalog database operations and search functionality.

**Class**: `Medicine`

**Constructor Parameters**:
- `id` (number) - Medicine ID
- `name` (string) - Medicine name
- `manufacturerName` (string) - Manufacturer name
- `type` (string) - Medicine type
- `packSizeLabel` (string) - Pack size label
- `composition1` (string) - First composition ingredient
- `composition2` (string) - Second composition ingredient

**Static Methods**:

#### `ensureTableExists()`
- **Purpose**: Ensures the medicine table exists in the database
- **Type**: Static method
- **Returns**: `Promise<void>`
- **Details**: Creates the `pharma` schema and `medicine_raw` table if they don't exist
- **Features**: Creates index on name column for better search performance

#### `searchMedicineNames(searchTerm)`
- **Purpose**: Searches for medicine names
- **Type**: Static method
- **Parameters**: `searchTerm` (string) - Search term for medicine names
- **Returns**: Promise<Array> - Array of medicine objects
- **Features**: 
  - Input validation (minimum 2 characters)
  - Case-insensitive search
  - Results ordered by name
  - Limited to 50 results for performance
  - Returns all medicine fields

**Instance Methods**:

#### `addMedicine()`
- **Purpose**: Adds a new medicine record to the database
- **Type**: Instance method
- **Returns**: Promise<Object> - Database query result with the created medicine
- **Features**: 
  - Automatic table existence check
  - Returns the created medicine data

---

### 5. medicine.mock.js
**Purpose**: Mock medicine model for testing without requiring a database connection.

**Class**: `MockMedicine`

**Constructor Parameters**:
- `id` (number) - Medicine ID
- `name` (string) - Medicine name
- `manufacturerName` (string) - Manufacturer name
- `type` (string) - Medicine type
- `packSizeLabel` (string) - Pack size label
- `composition1` (string) - First composition ingredient
- `composition2` (string) - Second composition ingredient

**Static Properties**:

#### `mockData`
- **Type**: Array
- **Purpose**: Contains mock medicine data for testing
- **Contains**: 6 sample medicine records with various types and manufacturers

**Static Methods**:

#### `searchMedicineNames(searchTerm)`
- **Purpose**: Simulates medicine search functionality using mock data
- **Type**: Static method
- **Parameters**: `searchTerm` (string) - Search term for medicine names
- **Returns**: Promise<Array> - Array of matching medicine objects
- **Features**: 
  - Simulates database delay (100ms)
  - Case-insensitive search
  - Returns matching records from mockData

---

## Common Patterns and Best Practices

### Database Schema Management
- All models use `ensureTableExists()` method to create tables
- Schema `pharma` is created for all tables
- Tables are created with appropriate constraints and indexes

### Data Validation
- Input validation in search methods (minimum length requirements)
- Type checking for constructor parameters
- Safe column validation in search queries

### Security Considerations
- Parameterized queries to prevent SQL injection
- Input sanitization for search terms
- Unique constraints to prevent duplicate data

### Error Handling
- Try-catch blocks for database operations
- Graceful fallbacks for missing data
- Proper error messages for debugging

### Performance Optimization
- Pagination in search results
- Index creation for frequently searched columns
- Result limits to prevent excessive data retrieval

---

## Database Schema Reference

### pharma.inventory
```sql
CREATE TABLE pharma.inventory (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  manufacturer_name VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  pack_size_label VARCHAR(100),
  composition1 TEXT,
  composition2 TEXT,
  mrp NUMERIC(10, 2),
  stock_quantity INTEGER,
  purchase_price NUMERIC(10, 2),
  selling_price NUMERIC(10, 2),
  stock_alert_threshold INTEGER DEFAULT 10,
  expiry_date DATE,
  user_name VARCHAR(500),
  insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_medicine_identity UNIQUE (name, manufacturer_name, pack_size_label, composition1, user_name)
);
```

### pharma.user
```sql
CREATE TABLE pharma.user (
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

### pharma.manufacturer_names
```sql
CREATE TABLE pharma.manufacturer_names (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL UNIQUE
);
```

### pharma.medicine_raw
```sql
CREATE TABLE pharma.medicine_raw (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  manufacturer_name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  pack_size_label VARCHAR(100),
  composition1 TEXT,
  composition2 TEXT
);

CREATE INDEX idx_medicine_name ON pharma.medicine_raw (name);
```

---

## Dependencies

### External Dependencies
- `pg` - PostgreSQL client library (indirect through database utility)

### Internal Dependencies
- `../database` - Database connection utility

---

## Testing

### Unit Testing
- Mock model (`medicine.mock.js`) provides testing capabilities
- Simulates database operations without actual database connection
- Includes sample data for comprehensive testing

### Integration Testing
- All models can be tested with actual database
- Table creation methods ensure test environment setup

---

## Development Notes

- Table existence checks are performed before each operation
- Unique constraints prevent duplicate data entry
- Automatic timestamp handling for insert/update operations
- Transaction-based operations for data integrity
- Error handling ensures data consistency