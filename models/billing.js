const db = require("../database");

class Billing {
  /**
   * Fetches all batch numbers recorded for a given medicine name.
   * @static
   * @async
   * @param {string} name - Exact medicine name to look up
   * @returns {Promise<Array<string>>} Array of batch numbers
   * @throws {Error} If database operations fail
   */
  static async getBatchNumbersByName(name, emailid) {
    const queryStr = "SELECT batch_number,mrp, selling_price, expiry_date FROM pharma.inventory WHERE name = $1 AND user_name = $2;";
    const result = await db.query(queryStr, [name, emailid]);

    return result.rows.map(row => ({
      batchNumber: row.batch_number,
      mrp: row.mrp,
      sellingPrice: row.selling_price,
      expiryDate: row.expiry_date,
    }));
  }
}

module.exports = Billing;
