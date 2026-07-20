const validate = require("validator");
const Medicine = require("../models/medicine");
const createToken = require("../token");

exports.addMedicine = async (req, res, next) => {
  const idnum = req.body.idnum;
  const name = req.body.name;
  const manufacturer_name = req.body.manufacturer_name;
  const type = req.body.type;
  const pack_size_label = req.body.pack_size_label;
  const composition1 = req.body.composition1;
  const composition2 = req.body.composition2;

  // Input validation
  if (!idnum || !name || !manufacturer_name || !type || !pack_size_label) {
    return res.status(400).json({ error: "All fields are mandatory" });
  }

  try {
    const new_medicine = new Medicine(idnum, name, manufacturer_name, type, pack_size_label, composition1, composition2);
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
  // Consider using query parameter instead of body for GET requests
  // GET requests typically use query parameters, not request body
  const searchTerm = req.query.name;
  
  // Input validation - consider trimming the search term
  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).json({ error: "Search term is required" });
  }

  // Consider adding maximum length validation to prevent abuse
  if (searchTerm.length < 2) {
    return res.status(400).json({ error: "Search term must be at least 2 characters long" });
  }

  // Consider adding maximum length validation
  if (searchTerm.length > 100) {
    return res.status(400).json({ error: "Search term must be less than 100 characters" });
  }

  try {
    const response = await Medicine.searchMedicineNames(searchTerm);
    const medicines = response || [];

    if (medicines.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No medicines found matching "${searchTerm}"`,
        data: [],
        // Consider adding pagination info for future scalability
        pagination: {
          page: 1,
          limit: 50,
          total: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Found ${medicines.length} medicine(s) matching "${searchTerm}"`,
      data: medicines,
      // Consider adding pagination info for future scalability
      pagination: {
        page: 1,
        limit: 50,
        total: medicines.length
      }
    });
  } catch (err) {
    // Consider adding more specific error logging
    console.error(`Medicine search error for term "${searchTerm}":`, err);
    return res.status(500).json({ 
      error: "Internal server error",
      // Consider adding error ID for tracking
      errorId: Date.now()
    });
  }
};
