const db = require("../database");

class Medicine {
  constructor(id, name, manufacturer_name, type, pack_size_label, composition1, composition2) {
    this.id = id;
    this.name = name;
    this.manufacturer_name = manufacturer_name;
    this.type = type;
    this.pack_size_label = pack_size_label;
    this.composition1 = composition1;
    this.composition2 = composition2;
  }

  // Helper method to ensure the schema and table exist before any operation
  // Consider running this as a migration script in production instead of on every operation
  static async ensureTableExists() {
    // 1. Create the schema if it doesn't exist
    const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS pharma;`;
    await db.query(createSchemaQuery);

    // 2. Create the table if it doesn't exist
    // Consider adding indexes for better search performance
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS pharma.medicine_raw (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        manufacturer_name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        pack_size_label VARCHAR(100),
        composition1 TEXT,
        composition2 TEXT
      );
    `;
    await db.query(createTableQuery);

    // Consider adding an index on name column for better search performance
    // This should be done as a separate migration to avoid recreating the table
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_medicine_name ON pharma.medicine_raw (name);
    `;
    await db.query(createIndexQuery);
  }

  async addMedicine() {
    // Ensure table exists first
    await Medicine.ensureTableExists();

    const query = `
      INSERT INTO pharma.medicine_raw (
        id,
        name,
        manufacturer_name,
        type,
        pack_size_label,
        composition1,
        composition2
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING *;
    `;

    return db.query(query, [
      this.id,
      this.name,
      this.manufacturer_name,
      this.type,
      this.pack_size_label,
      this.composition1,
      this.composition2,
    ]);
  }

  static async searchMedicineNames(searchTerm) {
    // Ensure table exists first
    await Medicine.ensureTableExists();

    // Consider adding input validation here as well
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error("Search term must be at least 2 characters long");
    }

    // Consider using prepared statements with parameterized queries for better security
    const query = `
      SELECT id, name, manufacturer_name, type, pack_size_label, composition1, composition2
      FROM pharma.medicine_raw
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT 50; -- Consider adding LIMIT for performance
    `;

    const searchPattern = `%${searchTerm}%`;
    const result = await db.query(query, [searchPattern]);
    return result.rows;
  }
}

module.exports = Medicine;
