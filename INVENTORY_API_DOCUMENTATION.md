# Inventory API Documentation

## Overview

This document describes the Inventory API endpoints that were implemented in PR #19 to expose the inventory table through an API for inserting data from frontend POST requests.

## API Endpoints

### POST /inventory/add-medicine

Add a new medicine to the inventory table.

**Request Body:**
```json
{
  "name": "Medicine Name",
  "manufacturer_name": "Manufacturer Name",
  "type": "Tablet",
  "pack_size_label": "10 tablets",
  "composition1": "Active Ingredient 1",
  "composition2": "Active Ingredient 2",
  "mrp": 100.50,
  "stock_quantity": 100,
  "purchase_price": 80.25,
  "selling_price": 95.75,
  "stock_alert_threshold": 10,
  "expiry_date": "2024-12-31",
  "user_name": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Medicine added successfully to inventory",
  "insertedId": 1
}
```

**Error Responses:**
```json
{
  "error": "Medicine name is required"
}
```

```json
{
  "error": "Manufacturer name is required"
}
```

```json
{
  "error": "Medicine type is required"
}
```

```json
{
  "error": "Invalid MRP value"
}
```

```json
{
  "error": "Invalid stock quantity"
}
```

```json
{
  "error": "Invalid purchase price"
}
```

```json
{
  "error": "Invalid selling price"
}
```

```json
{
  "error": "Invalid expiry date format"
}
```

## Database Schema

### Inventory Table (pharma.inventory)
```sql
CREATE TABLE IF NOT EXISTS pharma.inventory (
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
  update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Details

### Security Features
- Input validation for all required fields
- Data type validation for numeric fields
- Date validation for expiry date
- Protection against SQL injection through parameterized queries
- Rejection of array payloads to prevent potential security issues

### Validation Rules
1. **Required Fields:**
   - `name`: Medicine name (cannot be empty)
   - `manufacturer_name`: Manufacturer name (cannot be empty)
   - `type`: Medicine type (cannot be empty)

2. **Numeric Fields:**
   - `mrp`: Must be a valid positive number
   - `stock_quantity`: Must be a valid non-negative integer
   - `purchase_price`: Must be a valid positive number
   - `selling_price`: Must be a valid positive number
   - `stock_alert_threshold`: Must be a valid non-negative integer (default: 10)

3. **Date Fields:**
   - `expiry_date`: Must be a valid date format (YYYY-MM-DD)

### Error Handling
- **400 Bad Request**: Invalid input data
- **500 Internal Server Error**: Database or server errors

### Usage Examples

#### Add a new medicine to inventory:
```bash
curl -X POST http://localhost:8080/inventory/add-medicine \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paracetamol 500mg",
    "manufacturer_name": "Genericart",
    "type": "Tablet",
    "pack_size_label": "10 tablets",
    "composition1": "Paracetamol 500mg",
    "mrp": 45.50,
    "stock_quantity": 200,
    "purchase_price": 35.25,
    "selling_price": 42.75,
    "stock_alert_threshold": 20,
    "expiry_date": "2024-12-31",
    "user_name": "pharmacist1"
  }'
```

#### Error example - missing required field:
```bash
curl -X POST http://localhost:8080/inventory/add-medicine \
  -H "Content-Type: application/json" \
  -d '{
    "manufacturer_name": "Genericart",
    "type": "Tablet"
  }'
```

## Frontend Integration

The inventory API is designed to be easily integrated with frontend applications:

1. **Form Submission**: Frontend forms can directly POST data to the endpoint
2. **Real-time Updates**: Immediate feedback on successful additions
3. **Error Handling**: Clear error messages for form validation
4. **User Tracking**: Automatic tracking of which user added the medicine

## Technical Implementation

### Files Modified
- `models/inventory.js`: Inventory model with database operations
- `controllers/inventory.js`: Controller handling request/response logic
- `routes/inventory.js`: Route definitions for inventory endpoints
- `index.js`: Updated to include inventory routes

### Database Operations
- Automatic table creation if not exists
- Schema creation in PostgreSQL
- Timestamp tracking for insert and update operations
- Parameterized queries for security

### Performance Considerations
- Indexes on frequently queried fields
- Connection pooling for database efficiency
- Input validation to prevent unnecessary database operations

## Future Enhancements

1. **Pagination**: Add pagination for large inventory lists
2. **Search Functionality**: Implement search by various criteria
3. **Update Operations**: Allow updating existing inventory records
4. **Delete Operations**: Allow removing inventory records
5. **Bulk Operations**: Support for batch operations
6. **Advanced Validation**: More sophisticated business rule validation
7. **Audit Logging**: Comprehensive audit trail for inventory changes