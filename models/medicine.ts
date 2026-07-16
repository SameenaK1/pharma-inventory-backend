
import db from '../database';

export default class Medicine {
  // We declare the property types at the class level
  public id?: number | string; // Optional if auto-incremented by DB
  public name: string;
  public manufacturerName: string;
  public type: string;
  public packSizeLabel: string;
  public composition1: string;
  public composition2: string;

  constructor(
    id: number | string | undefined,
    name: string,
    manufacturerName: string,
    type: string,
    packSizeLabel: string,
    composition1: string,
    composition2: string
  ) {
    this.id = id;
    this.name = name;
    this.manufacturerName = manufacturerName;
    this.type = type;
    this.packSizeLabel = packSizeLabel;
    this.composition1 = composition1;
    this.composition2 = composition2;
  }
 

  async addmedicine() {

    // PostgreSQL uses $1, $2, $3 placeholders instead of ?
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
  ?, ?, ?, ?, ?, ?, ?
); RETURNING *;
    `;
    
    return db.query(query, [this.id, this.name, this.manufacturerName, this.type, this.packSizeLabel, this.composition1, this.composition2]);
  }
}
