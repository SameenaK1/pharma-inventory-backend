const db = require("../database");

class Inventory {
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
  }

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

    let queryStr = "SELECT * FROM pharma.inventory";

    if (whereClauses.length > 0) {
      queryStr += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    if (userOrderBy && userOrderBy !== "insert_date" && allowedColumns.includes(userOrderBy)) {
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
    return result.rows;
  }
}

module.exports = Inventory;
