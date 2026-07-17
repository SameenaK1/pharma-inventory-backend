const validate = require("validator");
const Medicine = require("../models/medicine");
const createToken = require("../token");

exports.addMedicine = async (req, res, next) => {
  const idnum = req.body.idnum;
  const name = req.body.name;
  const manufacturerName = req.body.manufacturer_name;
  const type = req.body.type;
  const packSizeLabel = req.body.pack_size_label;
  const composition1 = req.body.composition1;
  const composition2 = req.body.composition2;

  // Input validation
  if (!idnum || !name || !manufacturerName || !type || !packSizeLabel) {
    return res.status(400).json({ error: "All fields are mandatory" });
  }

  try {
    const new_medicine = new Medicine(idnum, name, manufacturerName, type, packSizeLabel, composition1, composition2);
    const response = await new_medicine.addMedicine();

    const insertId = response[0]?.insertId || response.insertId;

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      insertedId: insertId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.searchMedicineNames = async (req, res, next) => {
 
  const searchTerm = req.body.name;
  
  // Input validation
  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).json({ error: "Search term is required" });
  }

  if (searchTerm.length < 2) {
    return res.status(400).json({ error: "Search term must be at least 2 characters long" });
  }

  try {
    const response = await Medicine.searchMedicineNames(searchTerm);
    const medicines = response || [];

    if (medicines.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No medicines found matching "${searchTerm}"`,
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: `Found ${medicines.length} medicine(s) matching "${searchTerm}"`,
      data: medicines
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
