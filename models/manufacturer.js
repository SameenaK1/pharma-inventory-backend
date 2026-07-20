const db = require("../database");

class Manufacturer {
  constructor(id, name) {
    this.id = id;
    this.name = name;

  }
  static async ensureTableExists() {
    const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS pharma;`;
    await db.query(createSchemaQuery);

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS pharma.manufacturer_names (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL UNIQUE
);
    `;
    await db.query(createTableQuery);

    
  }

  
  static async searchManufacturerNames(searchTerm) {
    await Manufacturer.ensureTableExists();
    const query = `
      SELECT id, name
      FROM pharma.manufacturer_names
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name ASC
      LIMIT 50; -- Consider adding LIMIT for performance
    `;

    const searchPattern = `%${searchTerm}%`;
    console.log(query, searchPattern);
    const result = await db.query(query, [searchPattern]);
    return result.rows;
  }
}

module.exports = Manufacturer;
