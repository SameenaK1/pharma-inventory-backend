const db = require("../database");
/**
 * Represents an inventory item with medicine details and stock information.
 * @class
 */
/**
 * Represents an inventory item with medicine details and stock information.
 * @class
 */
class Inventory {
  /**
   * Creates an instance of Inventory.
   * @param {string} name - The name of the medicine
   * @param {string} manufacturerName - The name of the manufacturer
   * @param {string} type - The type/category of medicine
   * @param {string} packSizeLabel - The label for the pack size
   * @param {string} composition1 - First composition ingredient
   * @param {string} composition2 - Second composition ingredient
   * @param {number} mrp - Maximum Retail Price
   * @param {number} stockQuantity - Current stock quantity
   * @param {number} purchasePrice - Purchase price per unit
   * @param {number} sellingPrice - Selling price per unit
   * @param {number} stockAlertThreshold - Threshold for stock alerts
   * @param {Date} expiryDate - Expiry date of the medicine
   * @param {string} userName - Username associated with the record
   * @param {Date} insertDate - Date when the record was inserted
   * @param {Date} updateDate - Date when the record was last updated
   */
  constructor(
    name,
    manufacturerName,
    type,
    packSizeLabel,
    composition1,
    composition2,
    mrp,
    stockQuantity,
    purchasePrice,
    sellingPrice,
    stockAlertThreshold,
    expiryDate,
    userName,
    insertDate,
    updateDate
  ) {
    this.name = name;
    this.manufacturerName = manufacturerName;
    this.type = type;
    this.packSizeLabel = packSizeLabel;
    this.composition1 = composition1;
    this.composition2 = composition2;
    this.mrp = mrp;
    this.stockQuantity = stockQuantity;
    this.purchasePrice = purchasePrice;
    this.sellingPrice = sellingPrice;
    this.stockAlertThreshold = stockAlertThreshold;
    this.expiryDate = expiryDate;
    this.userName = userName;
    this.insertDate = insertDate;
    this.updateDate = updateDate;
  }

  /**
   * Ensures the inventory table exists in the database by creating the schema and table if needed.
   * @static
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If table creation fails
   */
  static async ensureTableExists() {
    // 1. Create the schema if it doesn't exist
    const createSchemaQuery = "CREATE SCHEMA IF NOT EXISTS pharma;";
    await db.query(createSchemaQuery);

    const createTableQuery = `
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
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_medicine_identity UNIQUE (name, manufacturer_name, pack_size_label, composition1, user_name)
      );
    `;
    await db.query(createTableQuery);

    // Create inventory_backup table if it doesn't exist
    const createBackupTableQuery = `
      CREATE TABLE IF NOT EXISTS pharma.inventory_backup (
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
        deleted_by VARCHAR(500),
        deleted_reason TEXT,
        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await db.query(createBackupTableQuery);
  }

  /**
   * Adds or updates an inventory record in the database.
   * If a record with the same identity exists, it updates the stock quantity and other fields.
   * @async
   * @returns {Promise<Object>} Database query result with the saved/updated record
   * @throws {Error} If table creation or database operation fails
   */
  async addInventory() {
    // Ensure table exists first
    try {
      await Inventory.ensureTableExists();
    } catch (error) {
      throw new Error(`Failed to ensure inventory table exists: ${error.message}`);
    }

    const query = `
      INSERT INTO pharma.inventory (
        name, manufacturer_name, type, pack_size_label, composition1, composition2,
        mrp, stock_quantity, purchase_price, selling_price, stock_alert_threshold,
        expiry_date, user_name, insert_date, update_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
      ON CONFLICT ON CONSTRAINT unique_medicine_identity 
      DO UPDATE SET 
        -- 1. Increment the stock quantity by adding the incoming stock
        stock_quantity = pharma.inventory.stock_quantity + EXCLUDED.stock_quantity,
        type = EXCLUDED.type,
        composition2 = EXCLUDED.composition2,
        mrp = EXCLUDED.mrp,
        purchase_price = EXCLUDED.purchase_price,
        selling_price = EXCLUDED.selling_price,
        stock_alert_threshold = EXCLUDED.stock_alert_threshold,
        expiry_date = EXCLUDED.expiry_date,
        update_date = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return db.query(query, [
      this.name,
      this.manufacturerName,
      this.type,
      this.packSizeLabel,
      this.composition1,
      this.composition2,
      this.mrp,
      this.stockQuantity,
      this.purchasePrice,
      this.sellingPrice,
      this.stockAlertThreshold,
      this.expiryDate,
      this.userName,
      this.insertDate,
      this.updateDate,
    ]);
  }

  /**
   * Searches inventory records with filtering, sorting, and pagination.
   * @static
   * @async
   * @param {Object} searchParams - Search criteria object
   * @param {string} [searchParams.name] - Medicine name to search for (case-insensitive)
   * @param {string} [searchParams.manufacturer_name] - Manufacturer name to search for (case-insensitive)
   * @param {string} [searchParams.type] - Medicine type to search for (case-insensitive)
   * @param {string} [searchParams.composition1] - First composition to search for (case-insensitive)
   * @param {string} [searchParams.composition2] - Second composition to search for (case-insensitive)
   * @param {string} [userOrderBy=name] - Field to sort results by (default: 'name')
   * @param {number} [page=1] - Page number for pagination (default: 1)
   * @param {number} [limit=50] - Number of records per page (default: 50)
   * @returns {Promise<Array>} Array of inventory records matching the search criteria
   * @throws {Error} If database operations fail
   */
  static async searchInventory(searchParams = {}, userOrderBy = "name", page = 1, limit = 50) {
    try {
      if (typeof Inventory.ensureTableExists === "function") {
        await Inventory.ensureTableExists();
      }
    } catch (tableErr) {
      console.warn("Table existence check skipped/failed:", tableErr.message);
    }

    const allowedColumns = ["name", "manufacturer_name", "type", "composition1", "composition2"];

    const safeUserOrderBy = allowedColumns.includes(userOrderBy) ? userOrderBy : "name";

    const whereClauses = [];
    const queryValues = [];
    let paramIndex = 1;

    for (const [column, value] of Object.entries(searchParams)) {
      if (allowedColumns.includes(column) && value !== undefined && value !== null && value !== "") {
        if (typeof value === "string") {
          whereClauses.push(`${column} ILIKE $${paramIndex}`);
          queryValues.push(`%${value}%`);
        } else {
          whereClauses.push(`${column} = $${paramIndex}`);
          queryValues.push(value);
        }
        paramIndex++;
      }
    }

    // Get total count for pagination metadata
    let totalCount = 0;
    try {
      let countQuery = "SELECT COUNT(*) as total FROM pharma.inventory";
      const countValues = [];

      if (Object.keys(searchParams).length > 0) {
        const whereCountClauses = [];
        let countParamIndex = 1;

        for (const [column, value] of Object.entries(searchParams)) {
          if (value !== undefined && value !== null && value !== '') {
            whereCountClauses.push(`${column} ILIKE $${countParamIndex}`);
            countValues.push(`%${value}%`);
            countParamIndex++;
          }
        }

        if (whereCountClauses.length > 0) {
          countQuery += ` WHERE ${whereCountClauses.join(' AND ')}`;
        }
      }

      const countResult = await db.query(countQuery, countValues);
      totalCount = parseInt(countResult.rows[0].total);
    } catch (countErr) {
      console.warn('Could not get total count:', countErr.message);
      totalCount = 0; // Fallback to 0, will be handled in controller
    }

    // Build the main query for records
    let queryStr = "SELECT * FROM pharma.inventory";

    if (whereClauses.length > 0) {
      queryStr += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    if (userOrderBy !== "insert_date" && allowedColumns.includes(userOrderBy)) {
      const textColumns = ["name", "manufacturer_name", "type", "pack_size_label", "composition1", "composition2", "user_name"];

      if (textColumns.includes(safeUserOrderBy)) {
        queryStr += ` ORDER BY LOWER(${safeUserOrderBy}) ASC`;
      } else {
        queryStr += ` ORDER BY ${safeUserOrderBy} ASC`;
      }
    } else {
      queryStr += " ORDER BY insert_date DESC";
    }

    const offset = (page - 1) * limit;
    queryStr += ` LIMIT ${limit} OFFSET ${offset};`;

    const result = await db.query(queryStr, queryValues);
    const records = result.rows;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: records,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: totalPages,
        hasNext: hasNext,
        hasPrev: hasPrev,
        hasNextPage: hasNext ? page + 1 : null,
        hasPrevPage: hasPrev ? page - 1 : null
      }
    };
  }
  static async deleteById(id, deletedBy = 'system', deletedReason = 'User Request') {
    // Start a transaction so if anything fails, the database rolls back safely
    await db.query("BEGIN");

    try {
      // 1. Delete the item and IMMEDIATELY return its data using RETURNING *
      const deleteQueryStr = `
      DELETE FROM pharma.inventory 
      WHERE id = $1 
      RETURNING *;
    `;
      const deleteResult = await db.query(deleteQueryStr, [id]);

      // If no row was found/deleted, roll back and return 0
      if (deleteResult.rowCount === 0) {
        await db.query("ROLLBACK");
        return 0;
      }

      // The deleted item's data is sitting right here:
      const oldData = deleteResult.rows[0];

      // 2. Insert that data into the backup table along with deletion metadata
      const backupQueryStr = `
  INSERT INTO pharma.inventory_backup (
    id, name, manufacturer_name, type, pack_size_label, composition1, composition2,
    mrp, stock_quantity, purchase_price, selling_price, stock_alert_threshold,
    expiry_date, user_name, insert_date, update_date, deleted_by, deleted_reason
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
  );
`;

      const backupValues = [
        oldData.id, // Explicitly inserting the original ID value here!
        oldData.name,
        oldData.manufacturer_name,
        oldData.type,
        oldData.pack_size_label,
        oldData.composition1,
        oldData.composition2,
        oldData.mrp,
        oldData.stock_quantity,
        oldData.purchase_price,
        oldData.selling_price,
        oldData.stock_alert_threshold,
        oldData.expiry_date,
        oldData.user_name,
        oldData.insert_date,
        oldData.update_date,
        deletedBy,
        deletedReason
      ];

      try {
        await db.query(backupQueryStr, backupValues);
      } catch (backupError) {
        console.error('Failed to backup inventory item:', backupError);
        throw new Error(`Failed to backup inventory item before deletion: ${backupError.message}`);
      }

      // Everything worked smoothly. Commit the transaction permanent!
      await db.query("COMMIT");
      return 1;

    } catch (error) {
      // If anything blew up during backup, cancel the deletion completely
      await db.query("ROLLBACK");
      throw error;
    }
  }
}

module.exports = Inventory;
