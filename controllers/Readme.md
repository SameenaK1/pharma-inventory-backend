# Controllers Documentation

This document provides comprehensive documentation for all controller files in the `pharma-inventory-backend/controllers` directory.

## Directory Structure

```
controllers/
├── README.md                           # This documentation file
├── IMPLEMENTATION_SUMMARY.md          # Overall implementation summary
├── INVENTORY_API_DOCUMENTATION.md     # Detailed inventory API documentation
├── MEDICINE_ENDPOINT_DOCUMENTATION.md # Medicine endpoint documentation
├── inventory.js                       # Inventory management controller
├── user.js                            # User authentication controller
├── manufacturer.js                    # Manufacturer search controller
└── medicine.js                        # Medicine management controller
```

## Controller Files Overview

### 1. inventory.js
**Purpose**: Handles all inventory-related operations including adding, retrieving, and deleting inventory items.

**Key Functions**:
- `addInventory()` - Add new inventory items or update existing ones
- `getInventory()` - Search and retrieve inventory items with pagination
- `deleteInventory()` - Delete inventory items with backup functionality

**API Endpoints**:
- `POST /api/inventory/add-inventory` - Add/update inventory
- `GET /api/inventory/get-inventory` - Get inventory with search/filter
- `DELETE /api/inventory/delete-inventory/:id` - Delete inventory item

**Features**:
- Input validation for all fields
- Automatic detection of insert vs update operations
- Stock quantity validation
- Price validation (MRP, purchase price, selling price)
- Expiry date validation
- Pagination support
- Search functionality across multiple fields

---

### 2. user.js
**Purpose**: Handles user authentication and management.

**Key Functions**:
- `signUp()` - User registration with password hashing
- `logIn()` - User authentication with JWT token generation

**API Endpoints**:
- `POST /api/user/signup` - User registration
- `POST /api/user/login` - User login

**Features**:
- Email validation
- Strong password validation
- bcrypt password hashing
- JWT token generation
- Input validation for all required fields

---

### 3. manufacturer.js
**Purpose**: Handles manufacturer search and management operations.

**Key Functions**:
- `searchManufacturerNames()` - Search for manufacturers by name

**API Endpoints**:
- `GET /api/manufacturer/search` - Search manufacturers

**Features**:
- Minimum 3-character search requirement
- Case-insensitive search
- Error handling for invalid search terms
- Response formatting with success/error status

---

### 4. medicine.js
**Purpose**: Handles medicine catalog management and search operations.

**Key Functions**:
- `addMedicine()` - Add new medicines to the catalog
- `searchMedicineNames()` - Search for medicines by name

**API Endpoints**:
- `POST /api/medicine/add` - Add new medicine
- `GET /api/medicine/search` - Search medicines

**Features**:
- Input validation for all required fields
- ID number validation
- Search term validation (minimum 2 characters)
- Error handling and response formatting

---

## Common Patterns and Best Practices

### Input Validation
- All controllers implement comprehensive input validation
- Type checking for numbers, dates, and strings
- Null/undefined checking for required fields
- Format validation for emails, dates, and numeric values

### Error Handling
- Consistent error response format across all controllers
- HTTP status codes following REST conventions
- Error logging for debugging purposes
- User-friendly error messages

### Response Format
- Standard JSON response structure
- Success/error status indicators
- Descriptive messages
- Consistent error ID generation

### Security Considerations
- Password hashing using bcrypt
- JWT token generation for authentication
- Input sanitization and validation
- SQL injection prevention through model layer

---

## Dependencies

### External Dependencies
- `bcrypt` - Password hashing
- `validator` - Input validation
- `jsonwebtoken` - JWT token generation
- `express` - Web framework

### Internal Dependencies
- `../models/*` - Database models
- `../token` - JWT token utilities
- `../database` - Database connection utilities

---

## File Naming Conventions

- Controllers use snake_case naming (e.g., `addInventory`)
- Export functions use camelCase (e.g., `addInventory`)
- File names match controller names (e.g., `inventory.js`)
- Documentation files use clear, descriptive names

---

## API Documentation References

- [INVENTORY_API_DOCUMENTATION.md](./INVENTORY_API_DOCUMENTATION.md) - Detailed inventory API documentation
- [MEDICINE_ENDPOINT_DOCUMENTATION.md](./MEDICINE_ENDPOINT_DOCUMENTATION.md) - Medicine endpoint documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Overall implementation summary

---

## Development Notes

- All controllers follow async/await pattern for better error handling
- Database operations are abstracted through model layer
- Controllers handle HTTP request/response logic only
- Logging is implemented for debugging and monitoring
- Error responses include error IDs for tracking

---

## Future Enhancements

- Add rate limiting for search endpoints
- Implement request/response logging
- Add more comprehensive validation rules
- Implement caching for frequently accessed data
- Add bulk operations support
- Implement API versioning