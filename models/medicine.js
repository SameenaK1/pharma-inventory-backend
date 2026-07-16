const db = require("../database");

class Medicine {
  constructor(id, name, manufacturerName, type, packSizeLabel, composition1, composition2) {
    this.id = id;
    this.name = name;
    this.manufacturerName = manufacturerName;
    this.type = type;
    this.packSizeLabel = packSizeLabel;
    this.composition1 = composition1;
    this.composition2 = composition2;
  }

  async addmedicine() {
    console.log(`inserting medicine into database ${this.name}`);
    const query = `
      INSERT INTO medicine_raw (
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
      this.manufacturerName,
      this.type,
      this.packSizeLabel,
      this.composition1,
      this.composition2,
    ]);
  }
}

module.exports = Medicine;
