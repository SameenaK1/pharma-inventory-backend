# Routes Documentation

This document provides comprehensive documentation for all route files in the `pharma-inventory-backend/routes` directory.

## Directory Structure

```
routes/
├── README.md                           # This documentation file
├── inventory.js                        # Inventory management routes
├── manufacturer.js                      # Manufacturer search routes
├── medicine.js                         # Medicine catalog routes
└── user.js                             # User authentication routes
```

## Route Files Overview

### 1. inventory.js
**Purpose**: Handles all inventory-related HTTP endpoints including CRUD operations.

**Import Dependencies**:
- `express` - Web framework
- `../controllers/inventory` - Inventory controller

**Route Definitions**:

#### `POST /api/inventory/add-inventory`
- **Controller**: `inventory.addInventory`
- **Purpose**: Add new inventory items or update existing ones
- **Request Body**: JSON object with inventory data
- **Response**: JSON response with success status, action taken, and data
- **Features**:
  - Input validation for all fields
  - Automatic detection of insert vs update operations
  - Stock quantity management
  - Error handling and validation

#### `GET /api/inventory/get-inventory`
- **Controller**: `inventory.getInventory`
- **Purpose**: Search and retrieve inventory items with pagination
- **Query Parameters**:
  - `name` (optional) - Medicine name filter
  - `manufacturer_name` (optional) - Manufacturer name filter
  - `type` (optional) - Medicine type filter
  - `composition1` (optional) - First composition filter
  - `composition2` (optional) - Second composition filter
  - `sortBy` (optional) - Field to sort by (default: 'name')
  - `page` (optional) - Page number (default: 1)
  - `limit` (optional) - Records per page (default: 50, max: 50)
- **Response**: JSON response with inventory data and pagination metadata
- **Features**:
  - Case-insensitive search
  - Pagination support
  - Multiple filter criteria
  - Sorting capabilities

#### `DELETE /api/inventory/delete-inventory/:id`
- **Controller**: `inventory.deleteInventory`
- **Purpose**: Delete inventory items with backup functionality
- **Path Parameters**:
  - `id` (required) - Inventory item ID to delete
- **Query Parameters**:
  - `user` (optional) - User performing the deletion
  - `reason` (optional) - Reason for deletion
- **Response**: JSON response with success status and message
- **Features**:
  - Transaction-based deletion
  - Automatic backup creation
  - Path parameter for ID (RESTful convention)

---

### 2. user.js
**Purpose**: Handles user authentication and management HTTP endpoints.

**Import Dependencies**:
- `express` - Web framework
- `../controllers/user` - User controller

**Route Definitions**:

#### `POST /api/user/sign-up`
- **Controller**: `user.signUp`
- **Purpose**: User registration with password hashing
- **Request Body**: JSON object with user registration data
  - `username` (required) - Username for login
  - `fullname` (required) - Full name of the user
  - `email` (required) - Email address for login
  - `password` (required) - Password for authentication
- **Response**: JSON response with user data and JWT token
- **Features**:
  - Email validation
  - Strong password validation
  - bcrypt password hashing
  - JWT token generation
  - Input validation for all required fields

#### `POST /api/user/log-In`
- **Controller**: `user.logIn`
- **Purpose**: User authentication with JWT token generation
- **Request Body**: JSON object with login credentials
  - `email` (required) - Email address
  - `password` (required) - Password
- **Response**: JSON response with authentication success and JWT token
- **Features**:
  - Email validation
  - Password verification
  - JWT token generation
  - Session management

---

### 3. manufacturer.js
**Purpose**: Handles manufacturer search HTTP endpoints.

**Import Dependencies**:
- `express` - Web framework
- `../controllers/manufacturer` - Manufacturer controller

**Route Definitions**:

#### `GET /api/manufacturer/search`
- **Controller**: `manufacturer.searchManufacturerNames`
- **Purpose**: Search for manufacturers by name
- **Query Parameters**:
  - `name` (required) - Search term for manufacturer names (minimum 3 characters)
- **Response**: JSON response with search results
- **Features**:
  - Minimum 3-character search requirement
  - Case-insensitive search
  - Results ordered by name
  - Limited to 50 results for performance

---

### 4. medicine.js
**Purpose**: Handles medicine catalog management and search HTTP endpoints.

**Import Dependencies**:
- `express` - Web framework
- `../controllers/medicine` - Medicine controller

**Route Definitions**:

#### `POST /api/medicine/add`
- **Controller**: `medicine.addMedicine`
- **Purpose**: Add new medicines to the catalog
- **Request Body**: JSON object with medicine data
  - `idnum` (required) - Medicine ID number
  - `name` (required) - Medicine name
  - `manufacturer_name` (required) - Manufacturer name
  - `type` (required) - Medicine type
  - `pack_size_label` (required) - Pack size label
  - `composition1` (optional) - First composition ingredient
  - `composition2` (optional) - Second composition ingredient
- **Response**: JSON response with success status and inserted ID
- **Features**:
  - Input validation for all required fields
  - ID number validation
  - Error handling and response formatting

#### `GET /api/medicine/medicine-name`
- **Controller**: `medicine.searchMedicineNames`
- **Purpose**: Search for medicines by name
- **Query Parameters**:
  - `name` (required) - Search term for medicine names (minimum 2 characters)
- **Response**: JSON response with search results
- **Features**:
  - Minimum 2-character search requirement
  - Case-insensitive search
  - Results ordered by name
  - Limited to 50 results for performance
  - Returns all medicine fields

---

## API Base URLs

All routes are prefixed with `/api` and organized by resource:

### Inventory Endpoints
- **Base**: `/api/inventory`
- **Operations**: add-inventory, get-inventory, delete-inventory

### User Endpoints
- **Base**: `/api/user`
- **Operations**: sign-up, log-In

### Manufacturer Endpoints
- **Base**: `/api/manufacturer`
- **Operations**: search

### Medicine Endpoints
- **Base**: `/api/medicine`
- **Operations**: add, medicine-name

---

## Request/Response Format

### Standard Response Format
```json
{
  "success": true/false,
  "message": "Descriptive message",
  "data": {},
  "pagination": {},
  "error": "Error message if applicable",
  "errorId": "Unique error identifier"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "errorId": "ERR-timestamp"
}
```

### Success Response Format
```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Authentication & Security

### Current Implementation
- No authentication middleware currently implemented
- All endpoints are publicly accessible
- Password hashing implemented in user controller

### Security Considerations
- Input validation on all endpoints
- Parameterized queries to prevent SQL injection
- CORS configuration should be added for production
- Rate limiting should be implemented for search endpoints

---

## Best Practices

### RESTful Design
- Use appropriate HTTP methods (GET, POST, DELETE)
- Use path parameters for resource identification
- Use query parameters for filtering and pagination
- Consistent naming conventions

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- Descriptive error messages
- Error logging for debugging

### Performance Optimization
- Pagination on large result sets
- Result limits for search endpoints
- Indexing on frequently searched columns
- Caching for frequently accessed data

---

## Future Enhancements

### Authentication
- Add JWT middleware for protected endpoints
- Implement role-based access control
- Add refresh token functionality

### Rate Limiting
- Implement rate limiting for search endpoints
- Add request throttling
- IP-based restrictions

### Monitoring
- Add request logging
- Implement performance monitoring
- Add health check endpoints

### API Documentation
- Add OpenAPI/Swagger documentation
- Implement API versioning
- Add response examples

---

## Testing

### Unit Testing
- Test individual route handlers
- Mock controller responses
- Test request validation

### Integration Testing
- Test complete request/response cycles
- Test database interactions
- Test error scenarios

### End-to-End Testing
- Test API with frontend applications
- Test authentication flows
- Test edge cases

---

## Development Notes

### Route Organization
- Routes are organized by resource type
- Each route file corresponds to a controller
- Clear separation of concerns
- Consistent naming conventions

### Middleware Considerations
- No middleware currently implemented
- Consider adding authentication middleware
- Consider adding validation middleware
- Consider adding logging middleware

### Deployment Considerations
- Environment-specific configurations
- Database connection management
- Error handling in production
- Performance optimization in production