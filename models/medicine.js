const db = require("../database");

class Medicine {
  constructor(id, name, manufacturerName, type,price, packSizeLabel, short_composition) {
    this.sku_id = id;
    this.name = name;
    this.manufacturerName = manufacturerName;
    this.type = type;
    this.price = price;
    this.packSizeLabel = packSizeLabel;
    this.short_composition = short_composition;
  }


  static async searchMedicineNames(searchTerm) {

    // Consider adding input validation here as well
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error("Search term must be at least 2 characters long");
    }

    // Consider using prepared statements with parameterized queries for better security
    const query = `
      SELECT sku_id, name, manufacturer_name, type, price, pack_size_label, short_composition
      FROM pharma.medicine_ttmg_stg
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
