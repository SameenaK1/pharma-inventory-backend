## Issues to Fix

### controllers/medicine.js
- **Line 8**: Field name mismatch - frontend sends 'manufacturer_name' but controller expects 'manufacturerName'
- **Line 10**: Field name mismatch - frontend sends 'pack_size_label' but controller expects 'packSizeLabel'

### controllers/user.js  
- **Line 12**: Typo in error message - "madatory" should be "mandatory"
- **Line 17**: Typo in error message - "Eamil" should be "Email"
- **Line 22**: Typo in error message - "Eamil" should be "Email"
- **Line 47**: Typo in error message - "madatory" should be "mandatory"
- **Line 56**: Typo in variable name - "respose" should be "response"
- **Line 57**: Typo in variable name - "respose" should be "response"
- **Line 70**: Missing error handling for the .then() chain - this should be caught

### models/medicine.js
- **Line 4**: Constructor parameter mismatch - 'manufacturer_name' vs 'manufacturerName', 'pack_size_label' vs 'packSizeLabel'
- **Line 58**: Property mismatch - 'this.manufacturerName' should be 'this.manufacturer_name'

These issues were identified in code review and need to be addressed to ensure consistent naming conventions and proper error handling.