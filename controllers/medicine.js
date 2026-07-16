const bcrypt = require("bcrypt");
const validate = require("validator");
const Medicine = require("../models/medicine");
const createToken = require("../token");

exports.addmedicine = async (req, res, next) => {
  const idnum = req.body.idnum;
  const name = req.body.name;
  const manufacturer_name = req.body.manufacturer_name;
  const type = req.body.type;
  const pack_size_label = req.body.pack_size_label;
  const composition1 = req.body.composition1;
  const composition2 = req.body.composition2;

  try {
    const new_medicine = new Medicine(idnum, name, manufacturer_name, type, pack_size_label, composition1, composition2);
    console.log("Medicine request initialized:");
    const response = await new_medicine.addmedicine();

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
