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
