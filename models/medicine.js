const db = require("../database");

class Medicine {
  constructor(id, name, manufacturerName, type, packSizeLabel, composition1, composition2) {
    this.id = id;
    this.name = name;
    this.manufacturerName  = manufacturerName;
    this.type = type;
    this.packSizeLabel = packSizeLabel;
    this.composition1 = composition1;
    this.composition2 = composition2;
  }

  // Helper method to ensure the schema and table exist before any operation
  static async ensureTableExists() {
    // 1. Create the schema if it doesn't exist
    const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS pharma;`;
    await db.query(createSchemaQuery);

    // 2. Create the table if it doesn't exist
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
      this.manufacturerName ,
      this.type,
      this.packSizeLabel,
      this.composition1,
      this.composition2,
    ]);
  }
}

module.exports = Medicine;
